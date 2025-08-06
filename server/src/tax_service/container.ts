import { TaxRuleRepository, TaxGroupRepository } from "./repositories";
import { TaxRuleService, TaxGroupService } from "./services";
import { TaxRuleController, TaxGroupController } from "./controllers";

/**
 * Dependency injection for tax rule
 */
const taxRuleRepository = TaxRuleRepository.getInstance();
const taxRuleService = TaxRuleService.getInstance(taxRuleRepository);
const taxRuleController = new TaxRuleController(taxRuleService);


/**
 * Dependency injection for tax group
 */
const taxGroupRepository = TaxGroupRepository.getInstance();
const taxGroupService = TaxGroupService.getInstance(taxGroupRepository, taxRuleRepository);
const taxGroupController = new TaxGroupController(taxGroupService);



export const container = {
    taxRuleService,
    taxRuleController,
    taxGroupService,
    taxGroupController
};