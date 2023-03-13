import { useEffect, useRef, useState } from "react";
import { Splide, SplideSlide } from '@splidejs/react-splide';

// Default theme
import '@splidejs/react-splide/css';

// or other themes
// import '@splidejs/react-splide/css/skyblue';
// import '@splidejs/react-splide/css/sea-green';

// // or only core styles
import '@splidejs/react-splide/css/core';

export default function TrainingSlide() {
    return <div>
        <Splide aria-label="My Favorite Images">
            <SplideSlide>
                <div>1</div>
            </SplideSlide>
            <SplideSlide>
                <div>2</div>
            </SplideSlide>
        </Splide>
    </div>
}