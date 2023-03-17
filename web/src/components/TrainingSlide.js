// import { useEffect, useRef, useState } from "react";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import Button from "react-bootstrap/Button";
import '../styles/css/TrainingSlide.css'

import MusclePercentage from "./MusclePercentage";

export default function TrainingSlide({trainingData}) {

    return <div className="training-slide">
        <div className="title">
            <div>
                <span>name: {trainingData.name}</span>
                <span>duration: {trainingData.duration}</span>
                <span>intensity: {trainingData.intensity}</span>
                <span>calories: {trainingData.calories}</span>
                <MusclePercentage
                    musclesPercent={trainingData.muscles}
                />
            </div>
            <div>
                <Button
                    variant="primary"
                    onClick={() => {
                        
                    }}
                >
                    Try it now!
                </Button>
            </div>
        </div>
        <Splide
            options={{
                type: 'slide',
                focus: 0,
                perMove: 1,
                fixedWidth : 160,
                fixedHeight: 200,
                gap: 10,
                rewind     : true,
		        pagination : false,
            }}
        >
            {
                Boolean(trainingData && trainingData.exercises) && 
                trainingData.exercises.map((exercise, idx) => {
                    return (
                        <SplideSlide
                            key={idx}
                        >
                            <div
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                            >
                                <div
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                    }}
                                >
                                    <img
                                        style={{width: '100%', height: '100%'}}
                                        src={process.env.PUBLIC_URL + "/thumb1.png"} 
                                        alt=""
                                    />
                                </div>
                                <div>
                                    <p>{exercise.name}</p>
                                    <p>reps: {exercise.reps}</p>
                                    <p>rest: {exercise.rest}</p>
                                    <MusclePercentage
                                        musclesPercent={exercise.muscles}
                                        limit={3}
                                    />
                                </div>
                            </div>
                        </SplideSlide>
                    )
                })
            }

            {/* <div className="splide__arrows">
                <button className="splide__arrow splide__arrow--prev">Prev</button>
                <button className="splide__arrow splide__arrow--next">Next</button>
            </div> */}
        </Splide>
    </div>
}