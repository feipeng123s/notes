interface Product {
    getName(): string;
}

class ConcreteProduct1 implements Product {
    getName(): string {
        return 'Product1';
    }
}

class ConcreteProduct2 implements Product {
    getName(): string {
        return 'Product2';
    }
}

abstract class Creator {
    public abstract factoryCreateMethod() : Product;

    // 抽象类中的方法可以实现，也可以不实现（不实现的方法称之为抽象方法，且只能存在于抽象类中）
    doSomething(): string {
        const product = this.factoryCreateMethod();
        return 'Creator.doSomething: The product name is ' + product.getName();
    }
}

class ConcreteCreator1 extends Creator {
    public factoryCreateMethod(): Product {
        return new ConcreteProduct1();
    }
}

class ConcreteCreator2 extends Creator {
    public factoryCreateMethod(): Product {
        return new ConcreteProduct2();
    }
}

const creator1 = new ConcreteCreator1();
const creator2 = new ConcreteCreator2();

console.log(creator1.doSomething());
console.log(creator2.doSomething());

// 输出
// Creator.doSomething: The product name is Product1
// Creator.doSomething: The product name is Product2