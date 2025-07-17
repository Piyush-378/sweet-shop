import chai, { use, request } from "chai";
import chaiHttp from "chai-http";
import app from "../app";
import Sweet from "../models/Sweet";

use(chaiHttp);
const { expect } = chai;

describe("Sweet Shop API", () => {
  before(async () => {
    await Sweet.deleteMany({});
  });

  let sweetId;

  it("should add a new sweet", (done) => {
    request(app)
      .post("/api/sweets")
      .send({ name: "Kaju Katli", category: "Nut-Based", price: 50, quantity: 10 })
      .end((err, res) => {
        expect(res).to.have.status(201);
        sweetId = res.body._id;
        done();
      });
  });

  it("should get all sweets", (done) => {
    request(app).get("/api/sweets").end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body.length).to.equal(1);
      done();
    });
  });

  it("should purchase sweets", (done) => {
    request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .send({ quantity: 5 })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.quantity).to.equal(5);
        done();
      });
  });

  it("should restock sweets", (done) => {
    request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .send({ quantity: 10 })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.quantity).to.equal(15);
        done();
      });
  });

  it("should delete the sweet", (done) => {
    request(app)
      .delete(`/api/sweets/${sweetId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });
});
