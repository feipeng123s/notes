const refValue = ref(0)

effect(function fn() {
  console.log(refValue.value)
})

refValue.value++

let activeEffect;

function ref(init) {
  class RefImpl {
    constructor(init) {
        this._value = init;
    }
    get value() {
      trackRefValue(this);
      return this._value
    }
    set value(newVal) {
      this._value = newVal;
      triggerRefValue(this, )
    }
  }
  return new RefImpl(init)
}

function trackRefValue(refValue) {
  if (!refValue.dep) {
    refValue.dep = new Set();
  }
  refValue.dep.add(activeEffect);
}


function triggerRefValue(refValue) {
  [...refValue.dep].forEach(effect => effect.fn())
}

function effect(fn) {
  activeEffect = new ReactiveEffect(fn)
  fn();
}

class ReactiveEffect {
  constructor(fn) {
    this.fn  = fn;
  }
}