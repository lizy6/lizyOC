ALTER TABLE ocai.APP_INFO MODIFY APP_ID CHAR(32) NOT NULL DEFAULT '';
ALTER TABLE ocai.APP_INFO MODIFY APP_NAME CHAR(32);
ALTER TABLE ocai.APP_MAKEFILE MODIFY APP_ID CHAR(255);
ALTER TABLE ocai.APP_MAKEFILE MODIFY FLAG CHAR(255);
ALTER TABLE ocai.APP_MAKEFILE MODIFY ID CHAR(32) NOT NULL DEFAULT '';
ALTER TABLE ocai.APP_MAKEFILE MODIFY PREREQUISITES CHAR(255);
ALTER TABLE ocai.APP_MAKEFILE MODIFY TARGET CHAR(255);
ALTER TABLE ocai.APP_MAKEFILE MODIFY USER_ID CHAR(32);
CREATE TABLE ocai.APP_RESULTS
(
    ID VARCHAR(64) PRIMARY KEY NOT NULL,
    SCHEDULE_NAME VARCHAR(32) NOT NULL,
    APP_NAME VARCHAR(32),
    EXECUTE_TIME VARCHAR(32) NOT NULL,
    SCHEDULE_TARGET VARCHAR(32),
    EXECUTE_STATUS VARCHAR(32),
    RESULTS_LIST VARCHAR(255)
);
ALTER TABLE ocai.APP_SCHEDULE MODIFY id VARCHAR(11) NOT NULL;
