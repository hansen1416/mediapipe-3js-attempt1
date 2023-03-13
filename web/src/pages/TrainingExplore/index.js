import { useEffect, useRef, useState } from "react";
import TrainingSlide from "../../components/TrainingSlide";

export default function TrainingExplore() {

    const canvasRef = useRef(null);

    useEffect(() => {
        console.log(1123123123)
    }, [])

    return <div>
        <div>Explore</div>
        <div>
            <div>
                <TrainingSlide/>
            </div>
            <div>
                <canvas
					ref={canvasRef}
				/>
            </div>
        </div>
        
    </div>
}