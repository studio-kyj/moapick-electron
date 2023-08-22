// const Datastore = require("nedb-promises");
// const Ajv = require("ajv");
// const portItemSchema = require("../schemas/portItem");

// class PortItemStore {
//   constructor() {
//     const ajv = new Ajv({
//       allErrors: true,
//       useDefaults: true,
//     });

//     this.schemaValidator = ajv.compile(portItemSchema);
//     const dbPath = `${process.cwd()}/portlist.db`; //실제 데이터가 저장될 파일
//     this.db = Datastore.create({
//       filename: dbPath,
//       timestampData: true,
//     });
//   }

//   validate(data) {
//     return this.schemaValidator(data);
//   }

//   create(data) {
//     const isValid = this.validate(data);
//     if (isValid) {
//       return this.db.insert(data);
//     }
//   }

//   read(_id) {
//     return this.db.findOne({ _id }).exec();
//   }

//   readAll() {
//     return this.db.find();
//   }

//   readActive() {
//     return this.db.find({ isDone: false }).exec();
//   }

//   archive({ _id }) {
//     return this.db.update({ _id }, { $set: { isDone: true } });
//   }

//   updateData(data) {
//     return this.db.update(
//       { _id: data._id },
//       { $set: { content: data.content } },
//       { multi: true },
//       function (err, numReplaced) {}
//     );
//   }

//   deleteData(_id) {
//     return this.db.remove({ _id: _id }, {}, function (err, numRemoved) {});
//   }

//   deleteAll() {
//     return this.db.remove({}, { multi: true }, function (err, numRemoved) {});
//   }
// }

// module.exports = new PortItemStore();
