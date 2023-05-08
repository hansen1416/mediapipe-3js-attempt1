import os
import cv2


def str_time(time_str):
    time_str = time_str.split(":")
    if len(time_str) == 2:
        time_str = int(time_str[0])*60 + int(time_str[1])
    else:
        time_str = int(time_str[0])

    return time_str


def video_slicer(filepath, start_time, end_time):
    """
    slice a piece of video, fron start_time to end_time in seconds
    """

    filename, fileext = os.path.basename(filepath).split('.')

    cap = cv2.VideoCapture(filepath)
    # read frame per second
    fps = cap.get(cv2.CAP_PROP_FPS)

    start_seconds = str_time(start_time)
    end_seconds = str_time(end_time)

    start_frame = start_seconds*fps
    end_frame = end_seconds*fps

    ret, frame = cap.read()
    h, w, _ = frame.shape

    # Define a fourcc (four-character code), and define a video writers
    # fourcc = cv2.VideoWriter_fourcc(*"XVID")
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(
        os.path.join('slices', f"{filename}_{start_time}-{end_time}.{fileext}"), fourcc, fps, (w, h))

    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

    f = start_frame
    while ret:
        f += 1

        if start_frame <= f <= end_frame:
            writer.write(frame)

        if f > end_frame:
            break

        ret, frame = cap.read()

    writer.release()

    cap.release()


if __name__ == "__main__":

    import argparse

    parser = argparse.ArgumentParser(
        prog='Save Video slices',
        description='Save a piece of video from `start_time` to `end_time` to a new file names `filename_starttime_endtime`',
        epilog='end===================')

    parser.add_argument(
        'filename', type=str, help="Path of a video file")
    parser.add_argument("-s", "--start", default="1", type=str, metavar="start time",
                        help="Start time in seconds or in a format like 01:59")
    parser.add_argument("-e", "--end", default="-1", type=str, metavar="end time",
                        help="End time in seconds or in a format like 01:59")

    args = parser.parse_args()

    video_slicer(args.filename, args.start, args.end)
