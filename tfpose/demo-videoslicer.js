const ffmpeg = require('ffmpeg');
const path = require('path')

video_name = '6packs.mp4'

const video_path = path.join('../', 'jobs', 'media', video_name)

const frames_folder = path.join('frames', video_name)

try {

    var process = new ffmpeg(video_path);

    process.then(function (video) {
        video.fnExtractFrameToJPG(frames_folder, {
            frame_rate : 1,
            number: 20,
            // every_n_frames : 10,
            file_name : 'frame_%t_%s'
        }, function (error, files) {
            if (!error) {
                console.log('Frames: ' + files);
            }
        });
    }, function (err) {
        console.log('Error: ' + err);
    });
} catch (e) {
    console.log(e.code);
    console.log(e.msg);
}
