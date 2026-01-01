<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create Views
        DB::unprepared("
            CREATE OR REPLACE VIEW citizen_with_age_classification AS
            SELECT
                CTZ_ID, CTZ_FIRST_NAME, CTZ_MIDDLE_NAME, CTZ_LAST_NAME,
                ctz_date_of_birth, ctz_is_alive, CTZ_IS_DELETED,
                EXTRACT(YEAR FROM AGE(CURRENT_DATE, ctz_date_of_birth)) AS age,
                CASE
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ctz_date_of_birth)) BETWEEN 0 AND 2 THEN 'Infant'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ctz_date_of_birth)) BETWEEN 3 AND 12 THEN 'Child'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ctz_date_of_birth)) BETWEEN 13 AND 17 THEN 'Teen'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ctz_date_of_birth)) BETWEEN 18 AND 24 THEN 'Young Adult'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ctz_date_of_birth)) BETWEEN 25 AND 39 THEN 'Adult'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ctz_date_of_birth)) BETWEEN 40 AND 59 THEN 'Middle Aged'
                    WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, ctz_date_of_birth)) >= 60 THEN 'Senior'
                    ELSE 'Unknown'
                END AS age_classification
            FROM citizen WHERE ctz_is_alive = TRUE;
        ");

        // 2. Create Timestamp Functions
        DB::unprepared("
            CREATE OR REPLACE FUNCTION update_last_updated_citizen() RETURNS TRIGGER AS $$ BEGIN NEW.CTZ_LAST_UPDATED = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
            CREATE OR REPLACE FUNCTION update_last_updated_household() RETURNS TRIGGER AS $$ BEGIN NEW.HH_LAST_UPDATED = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
            CREATE OR REPLACE FUNCTION update_last_updated_infrastructure() RETURNS TRIGGER AS $$ BEGIN NEW.INF_LAST_UPDATED = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
            CREATE OR REPLACE FUNCTION update_last_updated_business() RETURNS TRIGGER AS $$ BEGIN NEW.BS_LAST_UPDATED = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
            CREATE OR REPLACE FUNCTION update_last_updated_transaction() RETURNS TRIGGER AS $$ BEGIN NEW.TL_LAST_UPDATED = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
            CREATE OR REPLACE FUNCTION update_last_updated_medical() RETURNS TRIGGER AS $$ BEGIN NEW.MH_LAST_UPDATED = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
            CREATE OR REPLACE FUNCTION update_last_updated_citizen_history() RETURNS TRIGGER AS $$ BEGIN NEW.CIHI_LAST_UPDATED = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
            CREATE OR REPLACE FUNCTION update_last_updated_settlement() RETURNS TRIGGER AS $$ BEGIN NEW.SETT_LAST_UPDATED = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
        ");

        // 3. Create Logging Functions
        DB::unprepared("
            CREATE OR REPLACE FUNCTION log_system_account_activity() RETURNS TRIGGER AS $$
            DECLARE v_entity_id INT; v_user_id INT := 0;
            BEGIN
                IF TG_OP = 'INSERT' THEN v_entity_id := NEW.SYS_USER_ID;
                ELSIF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN v_entity_id := OLD.SYS_USER_ID; END IF;
                BEGIN v_user_id := current_setting('app.current_user_id', true)::INT;
                EXCEPTION WHEN OTHERS THEN v_user_id := 0; END;
                INSERT INTO SYSTEM_ACTIVITY_LOG (ACT_ACTION_TYPE, ACT_TABLE_NAME, ACT_ENTITY_ID, SYS_USER_ID, ACT_DESCRIPTION)
                VALUES (TG_OP::action_type_enum, TG_TABLE_NAME, v_entity_id, v_user_id, CONCAT('Action ', TG_OP, ' on ', TG_TABLE_NAME, ' ID = ', v_entity_id));
                RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
            END; $$ LANGUAGE plpgsql;

            CREATE OR REPLACE FUNCTION log_generic_activity() RETURNS TRIGGER AS $$
            DECLARE v_entity_id INT; v_col_name TEXT;
            BEGIN
                -- Determine primary key column based on table name (simplified for brevity)
                IF TG_TABLE_NAME = 'citizen' THEN v_entity_id := CASE WHEN TG_OP='DELETE' THEN OLD.CTZ_ID ELSE NEW.CTZ_ID END;
                ELSIF TG_TABLE_NAME = 'household_info' THEN v_entity_id := CASE WHEN TG_OP='DELETE' THEN OLD.HH_ID ELSE NEW.HH_ID END;
                ELSIF TG_TABLE_NAME = 'business_info' THEN v_entity_id := CASE WHEN TG_OP='DELETE' THEN OLD.BS_ID ELSE NEW.BS_ID END;
                ELSIF TG_TABLE_NAME = 'infrastructure' THEN v_entity_id := CASE WHEN TG_OP='DELETE' THEN OLD.INF_ID ELSE NEW.INF_ID END;
                ELSIF TG_TABLE_NAME = 'transaction_log' THEN v_entity_id := CASE WHEN TG_OP='DELETE' THEN OLD.TL_ID ELSE NEW.TL_ID END;
                ELSIF TG_TABLE_NAME = 'medical_history' THEN v_entity_id := CASE WHEN TG_OP='DELETE' THEN OLD.MH_ID ELSE NEW.MH_ID END;
                ELSIF TG_TABLE_NAME = 'citizen_history' THEN v_entity_id := CASE WHEN TG_OP='DELETE' THEN OLD.CIHI_ID ELSE NEW.CIHI_ID END;
                ELSIF TG_TABLE_NAME = 'settlement_log' THEN v_entity_id := CASE WHEN TG_OP='DELETE' THEN OLD.SETT_ID ELSE NEW.SETT_ID END;
                END IF;

                INSERT INTO SYSTEM_ACTIVITY_LOG (ACT_ACTION_TYPE, ACT_TABLE_NAME, ACT_ENTITY_ID, SYS_USER_ID, ACT_DESCRIPTION)
                VALUES (TG_OP::action_type_enum, TG_TABLE_NAME, v_entity_id, current_setting('app.current_user_id', true)::INT, CONCAT('Action ', TG_OP, ' on ', TG_TABLE_NAME, ' ID = ', v_entity_id));
                RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
            END; $$ LANGUAGE plpgsql;
        ");

        // 4. Attach Triggers
        DB::unprepared("
            CREATE TRIGGER set_citizen_last_updated BEFORE UPDATE ON CITIZEN FOR EACH ROW EXECUTE FUNCTION update_last_updated_citizen();
            CREATE TRIGGER set_household_last_updated BEFORE UPDATE ON HOUSEHOLD_INFO FOR EACH ROW EXECUTE FUNCTION update_last_updated_household();
            CREATE TRIGGER set_infrastructure_last_updated BEFORE UPDATE ON INFRASTRUCTURE FOR EACH ROW EXECUTE FUNCTION update_last_updated_infrastructure();
            CREATE TRIGGER set_business_last_updated BEFORE UPDATE ON BUSINESS_INFO FOR EACH ROW EXECUTE FUNCTION update_last_updated_business();
            CREATE TRIGGER set_transaction_last_updated BEFORE UPDATE ON TRANSACTION_LOG FOR EACH ROW EXECUTE FUNCTION update_last_updated_transaction();
            CREATE TRIGGER set_medical_last_updated BEFORE UPDATE ON MEDICAL_HISTORY FOR EACH ROW EXECUTE FUNCTION update_last_updated_medical();
            CREATE TRIGGER set_citizen_history_last_updated BEFORE UPDATE ON CITIZEN_HISTORY FOR EACH ROW EXECUTE FUNCTION update_last_updated_citizen_history();
            CREATE TRIGGER set_settlement_last_updated BEFORE UPDATE ON SETTLEMENT_LOG FOR EACH ROW EXECUTE FUNCTION update_last_updated_settlement();

            CREATE TRIGGER trg_log_system_account_activity AFTER INSERT OR UPDATE OR DELETE ON SYSTEM_ACCOUNT FOR EACH ROW EXECUTE FUNCTION log_system_account_activity();
            CREATE TRIGGER trg_log_citizen AFTER INSERT OR UPDATE OR DELETE ON CITIZEN FOR EACH ROW EXECUTE FUNCTION log_generic_activity();
            CREATE TRIGGER trg_log_household AFTER INSERT OR UPDATE OR DELETE ON HOUSEHOLD_INFO FOR EACH ROW EXECUTE FUNCTION log_generic_activity();
            CREATE TRIGGER trg_log_business AFTER INSERT OR UPDATE OR DELETE ON BUSINESS_INFO FOR EACH ROW EXECUTE FUNCTION log_generic_activity();
            CREATE TRIGGER trg_log_infra AFTER INSERT OR UPDATE OR DELETE ON INFRASTRUCTURE FOR EACH ROW EXECUTE FUNCTION log_generic_activity();
            CREATE TRIGGER trg_log_transaction AFTER INSERT OR UPDATE OR DELETE ON TRANSACTION_LOG FOR EACH ROW EXECUTE FUNCTION log_generic_activity();
            CREATE TRIGGER trg_log_medical AFTER INSERT OR UPDATE OR DELETE ON MEDICAL_HISTORY FOR EACH ROW EXECUTE FUNCTION log_generic_activity();
            CREATE TRIGGER trg_log_citizen_history AFTER INSERT OR UPDATE OR DELETE ON CITIZEN_HISTORY FOR EACH ROW EXECUTE FUNCTION log_generic_activity();
            CREATE TRIGGER trg_log_settlement AFTER INSERT OR UPDATE OR DELETE ON SETTLEMENT_LOG FOR EACH ROW EXECUTE FUNCTION log_generic_activity();
        ");
    }

    public function down(): void
    {
        // Drop Functions (Triggers drop automatically with functions/tables usually, but explicit drops are safer)
        DB::unprepared("DROP FUNCTION IF EXISTS update_last_updated_citizen CASCADE");
        DB::unprepared("DROP FUNCTION IF EXISTS update_last_updated_household CASCADE");
        DB::unprepared("DROP FUNCTION IF EXISTS update_last_updated_infrastructure CASCADE");
        DB::unprepared("DROP FUNCTION IF EXISTS update_last_updated_business CASCADE");
        DB::unprepared("DROP FUNCTION IF EXISTS update_last_updated_transaction CASCADE");
        DB::unprepared("DROP FUNCTION IF EXISTS update_last_updated_medical CASCADE");
        DB::unprepared("DROP FUNCTION IF EXISTS update_last_updated_citizen_history CASCADE");
        DB::unprepared("DROP FUNCTION IF EXISTS update_last_updated_settlement CASCADE");
        DB::unprepared("DROP FUNCTION IF EXISTS log_system_account_activity CASCADE");
        DB::unprepared("DROP FUNCTION IF EXISTS log_generic_activity CASCADE");

        // Drop View
        DB::unprepared("DROP VIEW IF EXISTS citizen_with_age_classification");
    }
};
