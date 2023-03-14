export default function MusclePercentage({musclesPercent}) {

    const muscleArr = [
        "chest","shoulders", "back","arms","abdominals","legs"
    ]

    return <div>
        {
            muscleArr.map((name) => {

                if (name in musclesPercent) {
                    return <span>{name}: {musclesPercent[name]}%</span>
                }

                return <></>
            })
        }
    </div>
}