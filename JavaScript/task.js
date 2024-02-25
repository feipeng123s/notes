setTimeout(() => {
    console.log(3);

    setTimeout(() => {
        console.log(8);
    });

    new Promise(resolve => {
        resolve();
        console.log(4);
    }).then(() => {
        console.log(6);
    });

    setTimeout(() => {
        console.log(9);
    });

    console.log(5);
});

setTimeout(() => {
    console.log(7);
});

new Promise(resolve => {
    resolve();
    console.log(1);
}).then(() => {
    console.log(2);
});