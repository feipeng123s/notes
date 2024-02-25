function Product1() {
}

Product1.prototype.getName = function() {
    return 'Product1';
}

function Product2() {
}

Product2.prototype.getName = function() {
    return 'Product2';
}

function Creator() {

}

Creator.prototype = {
    Product1,
    Product2
}

Creator.prototype.factoryCreateMethod = function(type) {
    let instance = new this[type]();
    return instance;
}

let creator = new Creator();
let product1 = creator.factoryCreateMethod('Product1');
let product2 = creator.factoryCreateMethod('Product2');
console.log(product1.getName());
console.log(product2.getName());

// 输出
// Product1
// Product2