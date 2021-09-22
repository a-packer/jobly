const { BadRequestError } = require("../expressError");

// Translates updating data to sql syntax
// dataToUpdate:
    // for a user this can include  { firstName, lastName, password, email, isAdmin }
    // for a company this can include {name, description, numEmployees, logoUrl}
// jsToSql: 
    // translating js object keys into SQL column name syntax
    // eg for a user --> firstName: "first_name"
    // eg for a company --> numEmployees: "num_employees"

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  // determine what data is to be updated
  if (keys.length === 0) throw new BadRequestError("No data");

  // convert object keys to SQL syntax. If direct not in jsToSql, use object key
  // map to include insert variables $n
  // eg. if key is in jsToSql, {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
