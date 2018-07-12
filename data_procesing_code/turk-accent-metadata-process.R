library(lubridate); library(magrittr); library(jsonlite); library(tidyverse);

json_to_df <- function(data_path, file) {
  d <- read_json(path = file.path(data_path, file))
  ip <- jsonlite::fromJSON(d$answers$ip)
  sentences <- d$answers$sentence_dict
  df_sentences <- purrr::map2_dfr(sentences, names(sentences), process_sent_info) %>% 
    mutate(turker_id = d$answers$turker_id)
  
  results <- tibble(
    turker_id = d$answers$turker_id, 
    assignment_id = d$AssignmentId,
    ip_country = ip$country,
    ip_region = ip$region,
    ip_city = ip$city,
    ip_zip = toString(ip$postal),
    first_language = d$answers$first_language,
    other_languages = d$answers$other_langs,
    country_grew_up = d$answers$country,
    state_grew_up = d$answers$us_state,
    age_exposure_english = d$answers$age_exposure_eng,
    age = d$answers$age,
    gender = d$answers$gender,
    comment = d$answers$comment,
    experiment_start_time = d$answers$start_time,
    experiment_end_time = d$answers$end_time,
    mobile_device = d$answers$mobile_device,
    webrtc_support = d$answers$webrtc$isWebRTCSupported,
    webrtc_has_mic = d$answers$webrtc$hasMicrophone,
    webrtc_has_mic_permissions = d$answers$webrtc$isWebsiteHasMicrophonePermissions
  ) 
  left_join(results, df_sentences, by = "turker_id")
}

process_sent_info <- function(list_item, list_name) {
  tibble(
    key = list_name,
    sentence = list_item[[1]],
    sentence_type = list_item[[2]]
    )
}

get_expt_len <- function(start, end) {
  difftime(end, start, units="mins") %>% 
    as.numeric() %>%
    round(2)
}

anonymize_turkids <- function(df) {
  df_anonymized <- df %>% 
    select(turkerid) %>%
    distinct() %>%
    mutate(id = 1:nrow(.)) 
  
  df %>% left_join(df_anonymized, by = "turkerid")
}

read_data_files <- function(d_path, .f) {
  safe_json_to_df <- safely(.f)
  files <- dir(d_path)
  df_list <- files %>% purrr::map(~ safe_json_to_df(data_path = d_path, .))
  results <- df_list %>% transpose() 
  ok <- results$error %>% map_lgl(is_null)
  df <- results$result %>% keep(ok) %>% map_df(bind_rows)
  
  # compute experiment length
  df %<>% mutate(exp_time_mins = get_expt_len(start = as_datetime(experiment_start_time),
                                              end = as_datetime(experiment_end_time)),
                 first_language = str_to_lower(first_language)) %>% 
    mutate(first_language = str_remove(first_language, '[[:punct:] ]+'))
  # variable cleanup 
  df <- df %>% mutate(gender = ifelse(str_detect(gender, "f"), "female", "male"))
  df
}

process_error_message <- function(error) {
  error_split <- error %>% str_split(pattern = " ", simplify = T)
  key_split <- error_split[2] %>% str_split(pattern = "_", simplify = T)
  tibble(
    key = key_split[1],
    turker_id = key_split[2] %>% str_remove(".wav"),
    error_message = error_split[3:length(error_split)] %>% str_flatten(collapse = " ")
  )
}

# read in error data from log file
df_errors <- readLines("../data_checking/turk_accent_us_gen_audio_test.log") %>% 
  as_data_frame() %>% 
  rename(error = value) %>% 
  pmap_dfr(., process_error_message) %>% 
  mutate(is_audio_valid = FALSE)
   
# read in turker metadata
d_path_r1 <- "../us-general-metadata/r1/production-results/"
d_path_r2 <- "../us-general-metadata/r2/production-results/"
d_path_r3 <- "../us-general-metadata/r3/production-results/"
r1_df <- read_data_files(d_path_r1, json_to_df)
r2_df <- read_data_files(d_path_r2, json_to_df)
r3_df <- read_data_files(d_path_r3, json_to_df)
df <- bind_rows(r1_df, r2_df, r3_df)

# add audio error logging data to turker metadata
df <- left_join(df, df_errors, by = c("turker_id", "key")) %>% 
  mutate(is_audio_valid = ifelse(is.na(is_audio_valid), TRUE, is_audio_valid))

## check turkerids in metadata against turkerids in audio directory
audio_dirs <- c(list.files("../raw_audio/wav_tarballs/3I01FDIL6NFKDZ49Q4XZ1I5GBDCD2R/.", full.names = F),
                list.files("../raw_audio/wav_tarballs/3CZH926SIDLZ8JXWQDR70FKZV6G4EK/.", full.names = F))

audio_dirs %<>% str_remove_all("turker_|.tar.gz")

# if there are turk ids here, then they exist in the metadata but we don't have audio files
missing_audio_files <- setdiff(unique(df$turker_id), audio_dirs)

df %<>% 
  mutate(is_audio_valid = ifelse(turker_id %in% missing_audio_files, FALSE, is_audio_valid),
         error_message = ifelse(turker_id %in% missing_audio_files, "audio not captured on web app", error_message))
         

audio_errors_log <- df %>% filter(error_message == "audio not captured on web app")

# save json
jsonlite::write_json(df, path = "../us-general-metadata/qsr-turk-accent-us-gen-metadata.json")
print("data processed and saved to disk")

### Some data checking code (should be moved)
theme_set(ggthemes::theme_base())
# what percent of audio files are not valid?
((nrow(df) - sum(df$is_audio_valid)) / nrow(df) * 100) %>% round(digits = 2)

## how many non-native english speakers?
df %>% 
  distinct(turker_id, first_language) %>% 
  filter(first_language != "english") %>% 
  count(first_language) %>% 
  ggplot(aes(x = forcats::fct_reorder(first_language, n, .desc = T), y = n)) +
  geom_bar(stat = "identity") +
  labs(x = "native language") +
  theme(axis.text.x = )

## how many speakers from each state?
df %>% 
  filter(state_grew_up != "International") %>% 
  distinct(turker_id, state_grew_up) %>% 
  count(state_grew_up) %>%
  ggplot(aes(x = forcats::fct_reorder(state_grew_up, n, .desc = T), y = n)) +
  geom_bar(stat = "identity") +
  labs(x = "state grew up")

## what's the age distribution?
df %>% distinct(turker_id, age) %>% pull(age) %>% qplot()