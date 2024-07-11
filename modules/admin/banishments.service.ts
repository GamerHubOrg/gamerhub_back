import { banishmentsModel } from "./admin.model";

export async function getAll({ limit = 30, offset = 0 }: { limit?: number, offset?: number }) {
  const list = await banishmentsModel.find().skip(offset).limit(limit);
  const count = await banishmentsModel.countDocuments();
  return {
    list,
    total: count,
  }
}

export function getOneByEmail(email: string) {
  return banishmentsModel.findOne({ email });
}

export function getOneByIp(ip: string) {
  return banishmentsModel.findOne({ ip });
}


export function fromBanishmentId(banishmentId: string) {
  return {
    getOne() {
      return banishmentsModel.findOne({ _id: banishmentId });
    },
    delete() {
      return banishmentsModel.deleteOne({ _id: banishmentId });
    }
  }
}