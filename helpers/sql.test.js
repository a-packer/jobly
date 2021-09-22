const request = require("supertest");

const app = require("../app");
const db = require("../db");
const {sqlForPartialUpdate} = require("./sql")

const {
    commonBeforeAll,
    commonAfterAll,
} = require("../models/_testCommon");

beforeAll(commonBeforeAll);
afterAll(commonAfterAll);


companyData = {
    name: "NewComp",
    description: "New Comp Description",
    numEmployees: 10,
    logoUrl: "http://new.img",
};

companyJsToSql =  {
    numEmployees: "num_employees",
    logoUrl: "logo_url",
};

userData = {
    firstName: "NewF",
    lastName: "NewL",
    email: "new@email.com",
    isAdmin: true
};

userJsToSql = {
    firstName: "first_name",
    lastName: "last_name",
    isAdmin: "is_admin"
};


test("Expect user data to be converted to sql syntax", async function() {
    test = sqlForPartialUpdate(userData, userJsToSql)
    expect(test).toEqual({"setCols": "\"first_name\"=$1, \"last_name\"=$2, \"email\"=$3, \"is_admin\"=$4", 
                          "values": ["NewF", "NewL", "new@email.com", true] });
});

test("Expect company data to be updated", async function() {
    test = sqlForPartialUpdate(companyData, companyJsToSql)
    expect(test).toEqual({"setCols": "\"name\"=$1, \"description\"=$2, \"num_employees\"=$3, \"logo_url\"=$4", "values": ["NewComp", "New Comp Description", 10, "http://new.img"]});
});
