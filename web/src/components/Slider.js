import { useEffect, useRef, useState } from "react";


export default function Slider({value, maxValu, minValue, width, height}){

    const [left, setleft] = useState(0)

    useEffect(() => {
        setleft(value / (maxValu - minValue))
    }, [value]);


    return (<div
        style={{position: 'relative', width: width + 'px', height: height + 'px'}}
    >
        <div
            style={{position: 'relative', width: '100%', height: '50%', marginTop: '25%', borderRadius: '6px'}}
        >
            <div
                style={{position: 'absolute', left: left + '%', width: '10%', height: '100%', borderRadius: '6px'}}
            ></div>
        </div>
    </div>)
}