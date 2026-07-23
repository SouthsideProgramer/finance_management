-- FinCalc Database Schema
-- PostgreSQL 16

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       VARCHAR(255),          -- NULL nếu dùng OAuth2
    full_name           VARCHAR(100) NOT NULL,
    avatar_url          TEXT,
    membership_tier     VARCHAR(20) DEFAULT 'FREE',  -- FREE, GOLD, PLATINUM
    is_email_verified   BOOLEAN DEFAULT FALSE,
    is_2fa_enabled      BOOLEAN DEFAULT FALSE,
    two_factor_secret   VARCHAR(255),
    theme               VARCHAR(20) DEFAULT 'light',
    show_balance_default BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BANK ACCOUNTS / CARDS
-- ============================================================
CREATE TABLE bank_accounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank_name           VARCHAR(100) NOT NULL,
    masked_card_number  VARCHAR(19) NOT NULL,   -- "5432 •••• •••• 0123"
    exp_date            VARCHAR(5) NOT NULL,    -- "12/28"
    is_primary          BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- USER SESSIONS / REFRESH TOKENS
-- ============================================================
CREATE TABLE user_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash  VARCHAR(255) NOT NULL,
    ip_address          VARCHAR(45),
    user_agent          TEXT,
    is_revoked          BOOLEAN DEFAULT FALSE,
    expires_at          TIMESTAMPTZ NOT NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRANSACTIONS
-- ============================================================
CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdraw')),
    amount          BIGINT NOT NULL,
    description     TEXT,
    quarter         VARCHAR(10),
    status          VARCHAR(20) DEFAULT 'completed',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role                VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content             TEXT NOT NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHAT_HISTORY (flat shortcut)
-- ============================================================
CREATE TABLE chat_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_users_email                ON users(email);
CREATE INDEX idx_bank_accounts_user_id     ON bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_is_primary  ON bank_accounts(user_id, is_primary);
CREATE INDEX idx_user_sessions_user_id     ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token       ON user_sessions(refresh_token_hash);
CREATE INDEX idx_transactions_user_id      ON transactions(user_id);
CREATE INDEX idx_transactions_created_at   ON transactions(created_at DESC);
CREATE INDEX idx_transactions_type          ON transactions(type);
CREATE INDEX idx_conversations_user_id     ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id  ON messages(conversation_id);
CREATE INDEX idx_chat_history_user_id      ON chat_history(user_id);
CREATE INDEX idx_chat_history_created_at   ON chat_history(created_at DESC);
