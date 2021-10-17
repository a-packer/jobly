"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be  { title, salary, equity, companyHandle }
   *
   * Returns  { id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {  
    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
        [ title, salary, equity, companyHandle ]);
    const job = result.rows[0];
    return job;
  }

  /** Find alljobs, or select jobs based on filter search queries
   * searchFilters: minSalary, hasEquity, title
   * Returns [{id, title, salary, equity, companyHandle}]
  */

  static async findAll({ minSalary, hasEquity, title } = {}) {
    let sqlQuery = `SELECT j.id,
                           j.title,
                           j.salary,
                           j.equity,
                           j.company_handle AS "companyHandle",
                           c.name AS "companyName"
                    FROM jobs j
                    LEFT JOIN companies AS c on c.handle = j.company_handle`;

    let whereFilters = []; // add desired filters to this array
    let queryValues = []; // add values relevant filters to this array to include with query
    

    /** if a filter is present, add a queryValue to queryValues and add the SQL filtering where expression into whereFilters */

    /******** TODO: Add if(filter) stuff */
    if (minSalary !== undefined) {
        queryValues.push(minSalary);
        whereFilters.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity === true) {
        whereFilters.push(`equity > 0`);
    }

    if (title !== undefined) {
        queryValues.push(`%${title}%`);
        whereFilters.push(`title ILIKE $${queryValues.length}`);
    }

    if (whereFilters.length > 0) {
      sqlQuery += " WHERE " + whereFilters.join(" AND ");
    }
    
    /** add Order By name to end of sqlQuery */  
    sqlQuery += " ORDER BY title"; 

    /** make the query with the fully constructed sqlQuery and any query values*/
    const companiesRes = await db.query(sqlQuery, queryValues);
    return companiesRes.rows;

  }


  /** Given a job handle, return data about job.
   *
   * Returns { TODO ******** }
   *   where company is [{  TODO ********, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
        `SELECT id, 
            title,
            salary,
            equity,
            company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1`, [id]
        );

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job`);

    const companiesRes = await db.query(
        `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
        FROM companies
        WHERE handle= $1`, [job.companyHandle]);

    delete job.cmopanyHandle;
    job.company = companiesRes.rows[0];

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
                      SET ${setCols}
                      WHERE id = ${idVarIdx}
                      RETURNING id,
                                title,
                                salary,
                                equity,
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`, [id]); 
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job`);
  }
}


module.exports = Job;
