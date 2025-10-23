export interface PolicyConfig {
    domainParam: string;
    permissionKey: string;
}
export declare const POLICIES_KEY = "policies";
export declare const Policies: (domainParam: string, permissionKey: string) => import("@nestjs/common").CustomDecorator<string>;
