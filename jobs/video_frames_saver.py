import os
import cv2


def video_slicer(filepath, start_time, end_time):

    filename, fileext = os.path.basename(filepath).split('.')

    cap = cv2.VideoCapture(filepath)
    # read frame per second
    fps = cap.get(cv2.CAP_PROP_FPS)

    start_frame = start_time*fps
    end_frame = end_time*fps

    ret, frame = cap.read()
    # h, w, _ = frame.shape
    folder = os.path.join('frames', f"{start_time}-{end_time}")

    if not os.path.exists(folder):
        os.mkdir(folder)

    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)

    f = start_frame
    while ret:

        if start_frame <= f <= end_frame and f % 10 == 0:
            cv2.imwrite(os.path.join(folder, f"{int(f)}.jpg"), frame)

        if f > end_frame:
            break

        ret, frame = cap.read()

        f += 1

    cap.release()


if __name__ == "__main__":

    import argparse

    parser = argparse.ArgumentParser(
        prog='Save Video slices',
        description='Save a piece of video from `start_time` to `end_time` to a new file names `filename_starttime_endtime`',
        epilog='end===================')

    parser.add_argument(
        'filename', type=str, help="Path of a video file")
    parser.add_argument("-s", "--start", default="1", type=int, metavar="start time",
                        help="Start time")
    parser.add_argument("-e", "--end", default="-1", type=int, metavar="end time",
                        help="End time")

    args = parser.parse_args()

    video_slicer(args.filename, args.start, args.end)
