import argparse
import torch
import os
import uuid
import re
import whisper_timestamped as whispered
from whisper_timestamped.make_subtitles import write_srt
import requests

# torch.cuda.set_device(0)  # Select GPU 0
# torch.cuda.empty_cache()  # Clear GPU memory
device = "cuda" if torch.cuda.is_available() else "cpu"

final_filename = str(uuid.uuid4())


media_folder = "public/assets/media/"
if not os.path.exists(media_folder):
    os.makedirs(media_folder)

# Parse command-line arguments
parser = argparse.ArgumentParser()
parser.add_argument("url", help="Video URL")
parser.add_argument("output", help="Output type (video or text)")
parser.add_argument("lang", help="Language of the output subtitle")
args = parser.parse_args()

URL = args.url
OUTPUT = args.output
LANG = args.lang

destination = media_folder

FILE_TO_SAVE_AS = os.path.join(media_folder, final_filename + ".mp4")
r = requests.get(URL, stream=True)
with open(FILE_TO_SAVE_AS, 'wb') as f:
    f.write(r.content)
# use ffmpeg to convert video to audio
os.system("ffmpeg -i {} -vn -acodec libmp3lame -ac 2 -ab 160k -ar 48000 {} -y".format(FILE_TO_SAVE_AS, os.path.join(media_folder, final_filename + ".mp3")))
torch.cuda.empty_cache()

audio_file = os.path.join(media_folder, final_filename + ".mp3")

audio_file = os.path.join(media_folder, final_filename + ".mp3")

whisper_model = whispered.load_model("medium", device="cpu")
result = whispered.transcribe(whisper_model, audio_file, beam_size=5, best_of=2, temperature=(0.0, 0.2, 0.4, 0.6, 0.8, 1.0), task="translate")

srt = write_srt(result["segments"], open(os.path.join(media_folder, final_filename + ".srt"), "w", encoding="utf8"))

# read the srt file
with open(os.path.join(media_folder, final_filename + ".srt"), "r", encoding="utf8") as f:
    lines = f.readlines() 
    srtFileToConvert = "".join(lines)

# convert the srt file to vtt
regex = r"(\d+:\d+:\d+)+,(\d+)"
content = "WEBVTT \n\n" + srtFileToConvert  # Replace this with your actual content

modified_content = re.sub(regex, r"\1.\2", content)
#save to vtt file
with open(os.path.join(media_folder, final_filename + ".vtt"), "w", encoding="utf8") as f:
    f.write(modified_content)

os.remove(os.path.join(media_folder, final_filename + ".mp3"))
os.remove(os.path.join(media_folder, final_filename + ".srt"))

os.system('cls' if os.name == 'nt' else 'clear')

print(final_filename)
