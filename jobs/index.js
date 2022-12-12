const THREE = require('three')
const fs = require('fs');
const { exit } = require('process');


fs.readdirSync('./animations').map((filename) => {
    
    filename = './animations/' + filename

    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));

    for (let item of data['tracks']) {

        if (item['type'] !== 'quaternion') {
            continue;
        }

        const vs = [];

        for (let i = 0; i < item['values'].length; i+=4) {
            const q = new THREE.Quaternion(item['values'][i], item['values'][i+1], item['values'][i+2], item['values'][i+3]);
            // note that we assume the up vetor is always (0,1,0)
            const v = new THREE.Vector3(0,1,0).applyQuaternion(q);
            vs.push(v.normalize());
        }

        item['Vectors'] = vs;
    }

    const content = JSON.stringify(data);

    fs.writeFileSync(filename, content);

    console.log(filename);
})

// exit()


// const data = JSON.parse(fs.readFileSync('./animations/BicycleCrunch.json', 'utf8'));

// for (let item of data['tracks']) {

//     if (item['type'] !== 'quaternion') {
//         continue;
//     }

//     const vs = [];

//     for (let i = 0; i < item['values'].length; i+=4) {
//         const q = new THREE.Quaternion(item['values'][i], item['values'][i+1], item['values'][i+2], item['values'][i+3]);
//         // note that we assume the up vetor is always (0,1,0)
//         const v = new THREE.Vector3(0,1,0).applyQuaternion(q);
//         vs.push(v.normalize());
//     }

//     item['Vectors'] = vs;
// }


// const content = JSON.stringify(data);

// // console.log(content)

// fs.writeFileSync('./animations/BicycleCrunch.json', content);

