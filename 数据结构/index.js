// 参考《数据结构（C语言版）》 第二版中 7.2图的存储结构 ==>邻接表

class Vertex{
    constructor(id, data) {
        this.indegree = 0;
        this.outdegree = 0;
        this.id = id;
        this.data = data;

        this.firstEdge = null;
    }

    setFirstEdge(edge) {
        this.firstEdge = edge;
    }

    getFirstEdge() {
        return this.firstEdge;
    }
}

class Edge{
    constructor(vertex, weight = 1) {
        // 边的头结点
        this.vertex = vertex;
        this.vertexIndex = null;
        // 下一个指向该顶点的边
        this.nextEdge = null;
        this.weight = weight;
    }

    setNextEdge(edge) {
        this.nextEdge = edge;
    }

    getNextEdge() {
        return this.nextEdge;
    }
}

class DirectedGraph{
    constructor() {
        // 顶点
        this.vertices = [];

        // 顶点数
        this.vCount = 0;
        // 边数
        this.eCount = 0;
    }

    addVertex(v) {
        this.vertices.push(v);
        this.vCount++;
    }

    removeVertex(index) {
        let vertexToDelete = this.vertices[index];
        this.vertices.forEach(vertex => {
            let firstEdge = vertex.getFirstEdge();
            if(firstEdge != null) {
                let nextEdge = firstEdge;
                if(nextEdge.vertex.id === vertexToDelete.id) {
                    vertex.setFirstEdge(nextEdge.getNextEdge());
                } else {
                    while(nextEdge.getNextEdge() != null && nextEdge.getNextEdge().vertex.id !== vertexToDelete.id) {
                        nextEdge = nextEdge.getNextEdge();
                    }
                    if(nextEdge.getNextEdge() != null && nextEdge.getNextEdge().vertex.id === vertexToDelete.id) {
                        nextEdge.setNextEdge(nextEdge.getNextEdge().getNextEdge());
                    }
                }
            }
        });

        this.vertices.splice(index, 1);
    }

    addEdge(fromIndex, toIndex) {
        let fromVertex = this.vertices[fromIndex];
        let edge = new Edge(fromVertex);

        let toVertex = this.vertices[toIndex];
        let firstEdge = toVertex.getFirstEdge();
        if(firstEdge == null) {
            toVertex.setFirstEdge(edge);
        } else {
            let nextEdge = firstEdge;
            while(nextEdge.getNextEdge() != null) {
                nextEdge = nextEdge.getNextEdge();
            }

            nextEdge.setNextEdge(edge);
        }
        this.eCount++;
    }
}

let vertices = [
    {id: 0, data: {name: 'A'}},
    {id: 1, data: {name: 'B'}},
    {id: 2, data: {name: 'C'}},
    {id: 3, data: {name: 'D'}},
    {id: 4, data: {name: 'E'}},
    {id: 5, data: {name: 'F'}}
];

let graph = new DirectedGraph();

// 添加顶点
vertices.forEach(item => {
    let vertex = new Vertex(item.id, item.data);
    graph.addVertex(vertex);
});

// 添加边
graph.addEdge(0, 1);
graph.addEdge(3, 1);
graph.addEdge(0, 3);
graph.addEdge(4, 3);
graph.addEdge(1, 4);
graph.addEdge(2, 4);
graph.addEdge(2, 5);

graph.vertices.forEach(vertex => {
    let str = vertex.data.name;
    let nextEdge = vertex.getFirstEdge();
    while(nextEdge != null) {
        str += '=>' + nextEdge.vertex.data.name;
        nextEdge = nextEdge.getNextEdge();
    }
    console.log(str);
});

// 卡恩算法
function Kahn() {
    // 初始顶点数
    let vCount = graph.vCount;
    let count = 0;
    let hasZeroVertex = true;
    let graphVer = graph.vertices;

    while(hasZeroVertex) {
        hasZeroVertex = false;
        for(let i = graphVer.length - 1; i >= 0; i--) {
            if(graphVer[i].getFirstEdge() == null) {
                count++;
                hasZeroVertex = true;
                graph.removeVertex(i);
            }
        }
    }
    console.log('顶点个数', vCount);
    console.log('没有环的顶点个数', count);
    return vCount === count;
}

Kahn();

// 深度优先

// 广度优先