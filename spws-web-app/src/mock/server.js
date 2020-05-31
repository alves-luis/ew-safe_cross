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
                longitude: -8.4069275,
                current_pedestrians: [
                    // {
                    //     id: "p-4",
                    //     latitude: 41.379396,
                    //     longitude: -8.542265,
                    // }, {
                    //     id: "p-5",
                    //     latitude: 41.379396,
                    //     longitude: -8.542245,
                    // }
                ],
                current_vehicles: [
                    // {
                    //     id: "v-6",
                    //     latitude: 41.379396,
                    //     longitude: -8.542165,
                    // }, {
                    //     id: "v-7",
                    //     latitude: 41.379396,
                    //     longitude: -8.542345,
                    // }
                ]
            });
            // server.schema.crosswalks.create({
            //     id: 2,
            //     latitude: 41.369396,
            //     longitude: -8.552255,
            // });
            // server.schema.crosswalks.create({
            //     id: 3,
            //     latitude: 38.7804,
            //     longitude: -9.4989,
            // });
        },
    });
};

export default createMockServer;
