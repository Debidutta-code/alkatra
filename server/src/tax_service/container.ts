import { TaxRuleRepository, TaxGroupRepository } from "./repositories";
import { TaxRuleService, TaxGroupService } from "./services";
import { TaxRuleController, TaxGroupController } from "./controllers";
import { CommonService } from "../services";
import { PropertyInfoRepository } from "../property_management/src/repositories";

/**
 * Dependency injection for common
 */
const propertyInfoRepository = PropertyInfoRepository.getInstance();
const commonService = CommonService.getInstance(propertyInfoRepository);

/**
 * Dependency injection for tax rule
 */
const taxRuleRepository = TaxRuleRepository.getInstance();
const taxRuleService = TaxRuleService.getInstance(taxRuleRepository, commonService);
const taxRuleController = new TaxRuleController(taxRuleService);


/**
 * Dependency injection for tax group
 */
const taxGroupRepository = TaxGroupRepository.getInstance();
const taxGroupService = TaxGroupService.getInstance(taxGroupRepository, taxRuleRepository, commonService);
const taxGroupController = new TaxGroupController(taxGroupService);



export const container = {
    taxRuleService,
    taxRuleController,
    taxGroupService,
    taxGroupController
};