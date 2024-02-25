class HistoryRouter{
    constructor() {
        this.routes = {};
        document.addEventListener('popstate', e => {
            const path = e.state && e.state.path;
            this.routes[path] && this.routes[path]();
        })
    }

    initPath(path) {
        window.history.replaceState({path}, null, path);
        this.routes[path] && this.routes[path]();
    }

    route(path, callback) {
        this.routes[path] = callback || function() {};
    }

    go(path) {
        history.pushState({path}, null, path);
        this.routes[path] && this.routes[path]();
    }
}

window.Router = new HistoryRouter();

// 注册路由
function changeBgColor(color){
    content.style.background = color;
}

Router.route(location.pathname, () => {
    changeBgColor('yellow');
});
Router.route('/red', () => {
    changeBgColor('red');
});
Router.route('/green', () => {
    changeBgColor('green');
});
Router.route('/blue', () => {
    changeBgColor('blue');
});

const content = document.querySelector('body');
Router.init(location.pathname);