import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../../components/ui/tabs";
import { TaxRules } from "./TaxRules";
import { TaxGroups } from "./TaxGroups";
import { Badge } from "../../../../components/ui/badge";

export const TaxServiceTabs = ({
  propertyId,
  accessToken,
  initialTaxRules,
  initialTaxGroups,
  onTaxRuleUpdate,
  onTaxGroupUpdate,
}: {
  propertyId: string;
  accessToken: string;
  initialTaxRules: any[];
  initialTaxGroups: any[];
  onTaxRuleUpdate: (rules: any[]) => void;
  onTaxGroupUpdate: (groups: any[]) => void;
}) => {
  return (
    <Tabs defaultValue="rules" className="w-full min-h-96">
      {/* Tab Headers with Badge Counts and Styling */}
      <TabsList className="w-full h-14 grid grid-cols-2 mb-8 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm transition-all">
        <TabsTrigger
          value="rules"
          className="py-3 px-4 flex items-center justify-center data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 
                     data-[state=active]:shadow-sm data-[state=active]:rounded-md 
                     transition-all duration-200 font-medium text-sm"
        >
          Tax Rules
          <Badge
            variant="secondary"
            className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs"
          >
            {initialTaxRules.length}
          </Badge>
        </TabsTrigger>

        <TabsTrigger
          value="groups"
          className="py-3 px-4 flex items-center justify-center data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 
                     data-[state=active]:shadow-sm data-[state=active]:rounded-md 
                     transition-all duration-200 font-medium text-sm"
        >
          Tax Groups
          <Badge
            variant="secondary"
            className="ml-2 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs"
          >
            {initialTaxGroups.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      {/* Tax Rules Tab */}
      <TabsContent value="rules" className="focus:outline-none">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Manage Tax Rules
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Define individual taxes (e.g., VAT, city tax) and their rates.
          </p>
          <TaxRules
            propertyId={propertyId}
            accessToken={accessToken}
            initialRules={initialTaxRules}
            onUpdate={onTaxRuleUpdate}
          />
        </div>
      </TabsContent>

      {/* Tax Groups Tab */}
      <TabsContent value="groups" className="focus:outline-none">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Manage Tax Groups
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Combine multiple tax rules into groups (e.g., "Standard Rate", "Luxury Tax").
          </p>
            <TaxGroups
              propertyId={propertyId}
              accessToken={accessToken}
              initialGroups={initialTaxGroups}
              availableRules={initialTaxRules}
              onUpdate={onTaxGroupUpdate}
            />
        </div>
      </TabsContent>
    </Tabs>
  );
};