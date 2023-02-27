
import { loadJSON } from "../../components/ropes";

const animationData = null

function fetchAnimationData(animation_filename) {
    loadJSON(
        process.env.PUBLIC_URL + "/animjson/" + animation_filename + ".json"
    ).then((data) => {
        animationData = data;
    })
}

export function analyzePose(data, animation_name) {

    fetchAnimationData(animation_name);

    if (!animationData) {
        return "";
    }


    if (data && data.length) {
        return `data length is, ${data.length}`;
    }
}