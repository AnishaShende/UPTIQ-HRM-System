"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkLocation = exports.EmploymentType = exports.Status = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
    UserRole["HR_ADMIN"] = "HR_ADMIN";
    UserRole["HR_MANAGER"] = "HR_MANAGER";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["EMPLOYEE"] = "EMPLOYEE";
    UserRole["READONLY"] = "READONLY";
})(UserRole || (exports.UserRole = UserRole = {}));
var Status;
(function (Status) {
    Status["ACTIVE"] = "ACTIVE";
    Status["INACTIVE"] = "INACTIVE";
    Status["PENDING"] = "PENDING";
    Status["DELETED"] = "DELETED";
})(Status || (exports.Status = Status = {}));
var EmploymentType;
(function (EmploymentType) {
    EmploymentType["FULL_TIME"] = "FULL_TIME";
    EmploymentType["PART_TIME"] = "PART_TIME";
    EmploymentType["CONTRACT"] = "CONTRACT";
    EmploymentType["INTERN"] = "INTERN";
})(EmploymentType || (exports.EmploymentType = EmploymentType = {}));
var WorkLocation;
(function (WorkLocation) {
    WorkLocation["OFFICE"] = "OFFICE";
    WorkLocation["REMOTE"] = "REMOTE";
    WorkLocation["HYBRID"] = "HYBRID";
})(WorkLocation || (exports.WorkLocation = WorkLocation = {}));
//# sourceMappingURL=index.js.map