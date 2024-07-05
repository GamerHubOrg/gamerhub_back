import {Schema} from "mongoose";

const UndercoverWordsSchema = new Schema({
  playerId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  word: { type: String, required: true }
}, { _id: false });

const UndercoverVoteSchema = new Schema({
  playerId: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
  vote: { type: String, required: true },
  turn: { type: Number, required: true }
}, { _id: false });

const UndercoverRecordSchema = new Schema({
  words: {type : [UndercoverWordsSchema], required : true},
  votes: { type: [UndercoverVoteSchema], required: true },
  civilianWord: { type: String, required : true },
  spyWord: { type: String, required : true },
  undercoverPlayerIds: [{ type: Schema.Types.ObjectId, ref: 'Users', required : true }],
  campWin: { type: String, required : true },
},
{ discriminatorKey: "gameName", _id: false });


export default UndercoverRecordSchema;
