// import { useEffect, useRef, useState } from "react";
import { Splide, SplideSlide } from '@splidejs/react-splide';
import Button from "react-bootstrap/Button";
import { cloneDeep } from "lodash";

import '../styles/css/TrainingSlideEditor.css'
import MusclePercentage from "./MusclePercentage";
import InputIncreaseDecrease from './InputIncreaseDecrease';

export default function TrainingSlideEditor({trainingData, settrainingData}) {

    function updateExercise(idx, dict) {
        const tmp = cloneDeep(trainingData);

        for (let i in tmp.exercises) {
            if (Number(i) === Number(idx)) {
                Object.assign(tmp.exercises[i], dict)
            }
        }

        settrainingData(tmp)
    }

    return <div className="training-slide-editor">
        {
            trainingData && trainingData.name && 
            <section>
                <div className="title">
                    <span>name: {trainingData.name}</span>
                    <span>duration: {trainingData.duration}</span>
                    <span>intensity: {trainingData.intensity}</span>
                    <span>calories: {trainingData.calories}</span>
                    <MusclePercentage
                        musclesPercent={trainingData.muscles}
                    />
                </div>
                <Splide
                    options={{
                        type: 'slide',
                        focus: 0,
                        perMove: 1,
                        fixedWidth : 160,
                        // fixedHeight: 200,
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
                                            <MusclePercentage
                                                musclesPercent={exercise.muscles}
                                                limit={3}
                                            />
                                        </div>
                                        <div>
                                            <div>
                                                <span>reps: </span>
                                                <span>
                                                    <InputIncreaseDecrease
                                                        value={exercise.reps}
                                                        onChange={(v) => {
                                                            updateExercise(idx, {reps: v})
                                                        }}
                                                    />
                                                </span>
                                            </div>
                                            <div>
                                                <span>rest: </span>
                                                <span>
                                                    <InputIncreaseDecrease
                                                        value={exercise.rest}
                                                        onChange={(v) => {
                                                            updateExercise(idx, {rest: v})
                                                        }}
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </SplideSlide>
                            )
                        })
                    }
                </Splide>
                <div
                    className='operation'
                >
                    <Button
                        variant="primary"
                        onClick={() => {
                            // todo, save to user's
                        }}
                    >
                        Save to my list
                    </Button>
                </div>
            </section>
        }
    </div>
}