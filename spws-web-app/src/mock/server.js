import { Server, Model } from "miragejs";

const createMockServer = () => {
    new Server({
        models: {
            crosswalk: Model
        },
        routes() {
            this.get("/crosswalk", (db) => {
                return db.crosswalks.all();
            });
            this.get("/crosswalk/:id", (db, request) => {
                let id = request.params.id

                return db.crosswalks.find(id)
            });
        },
        seeds(server) {
            server.schema.crosswalks.create({
                id: 3,
                latitude: 41.5476900,
                longitude: -8.4069275
            });
            server.schema.crosswalks.create({
                id: 4,
                latitude: 41.5476850,
                longitude: -8.4067275
            });
        },
    });
};

export default createMockServer;
