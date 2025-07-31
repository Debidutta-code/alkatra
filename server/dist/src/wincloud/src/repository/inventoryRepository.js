"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryRepository = void 0;
const inventoryModel_1 = require("../model/inventoryModel");
class InventoryRepository {
    upsertInventory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const operations = data.map(data => ({
                updateOne: {
                    filter: {
                        hotelCode: data.hotelCode,
                        invTypeCode: data.invTypeCode,
                        'availability.startDate': new Date(data.availability.startDate),
                    },
                    update: {
                        $set: {
                            'availability.endDate': new Date(data.availability.endDate),
                            'availability.count': data.availability.count,
                            updatedAt: new Date(),
                        }
                    },
                    upsert: true
                }
            }));
            return inventoryModel_1.Inventory.bulkWrite(operations);
        });
    }
}
exports.InventoryRepository = InventoryRepository;
//# sourceMappingURL=inventoryRepository.js.map