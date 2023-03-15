import { useEffect, useRef, useState } from "react";

import MusclePercentage from "../../components/MusclePercentage";

export default function TrainingBuilder() {
    const canvasRef = useRef(null);

    const kasten = useRef(null);

    const [itemWidth, setitemWidth] = useState(0)
    const [itemHeight, setitemHeight] = useState(0)

    const pageSize = 12;

    const [totalPage, settotalPage] = useState([1,2,3])
    const [currentPage, setcurrentPage] = useState(1)
    const [exercisePages, setexercisePages] = useState([])

	useEffect(() => {

        const {width} = kasten.current.getBoundingClientRect();

        setitemWidth(parseInt(width/4))
        setitemHeight(parseInt(width/4) + 100)

		fetch(process.env.PUBLIC_URL + "/data/exercise-list.json")
		.then((response) => response.json())
		.then((data) => {

            const tmp = [[]]

            for (let e of data) {

                if (tmp[ tmp.length - 1].length >= pageSize) {
                    tmp.push([])
                }

                tmp[tmp.length-1].push(e)
            }

			setexercisePages(tmp)
		});

	}, []);

	return (
		<div 
            className="main-content training-builder"
            ref={kasten}
        >
			<div className="title">
				<h1>Training Builder</h1>
			</div>
            <div className="title">
                <div><span>Filter placeholder</span></div>
            </div>
			<div>
                {
                    exercisePages.map((exercises, idx) => {
                        return (
                            <div
                                key={idx}
                            >
                                {
                                    exercises.map((e, idx1) => {
                                        return (
                                        <div
                                            key={idx1}
                                            style={{
                                                width: itemWidth+'px',
                                                height: itemHeight+'px',
                                                display: "inline-block",
                                            }}
                                        >
                                            <div>
                                                <img
                                                    style={{width: '100%', height: '100%'}}
                                                    src={process.env.PUBLIC_URL + "/thumb.png"} 
                                                    alt=""
                                                />
                                            </div>
                                            <div>
                                                <span>{e.name}</span>
                                            </div>
                                            <div>
                                                <MusclePercentage
                                                    musclesPercent={e.muscles}
                                                />
                                            </div>
                                        </div>)
                                    })
                                }
                            </div>)
                    })
                }
            </div>
            <div
                className="pagination"
            >
                {
                    totalPage.map((p) => {
                        return (
                            <div
                                className={["page", currentPage === p ? 'active' : ''].join(' ')}
                                key={p}
                            ><span>{p}</span></div>
                        )
                    })
                }
            </div>
            <div>
                <canvas ref={canvasRef} />
            </div>
		</div>
	);
}