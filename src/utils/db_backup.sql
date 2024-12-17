--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2024-12-17 19:20:31

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16503)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 4934 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 223 (class 1255 OID 16404)
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_timestamp() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16544)
-- Name: items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    type character varying(30),
    value integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.items OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16543)
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_id_seq OWNER TO postgres;

--
-- TOC entry 4935 (class 0 OID 0)
-- Dependencies: 221
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- TOC entry 219 (class 1259 OID 16469)
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    reward jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16480)
-- Name: user_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    task_id uuid NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    start_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    end_time timestamp without time zone,
    progress jsonb DEFAULT '{}'::jsonb,
    reward_claimed boolean DEFAULT false
);


ALTER TABLE public.user_tasks OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16454)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(255) NOT NULL,
    is_guest boolean DEFAULT false,
    progress jsonb DEFAULT '{}'::jsonb,
    logout_position jsonb DEFAULT '{"x": 0, "y": 0}'::jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password_hash character varying(255) DEFAULT ''::character varying,
    level integer DEFAULT 1,
    exp integer DEFAULT 0,
    hp integer DEFAULT 100 NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4764 (class 2604 OID 16547)
-- Name: items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- TOC entry 4928 (class 0 OID 16544)
-- Dependencies: 222
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items (id, name, description, type, value, created_at) FROM stdin;
\.


--
-- TOC entry 4925 (class 0 OID 16469)
-- Dependencies: 219
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, name, description, reward, created_at, updated_at) FROM stdin;
0e92e27e-5977-47d4-89cc-880be7d56c61	Collect 10 Apples	Collect 10 apples from the forest.	{"item": "apple_sword", "coins": 100}	2024-12-11 19:56:17.764186	2024-12-11 19:56:17.764186
8790074e-e4e9-4e2e-b401-ac8989b8b9a4	Defeat the Dragon	Find and defeat the dragon in the cave.	{"item": "dragon_shield", "coins": 500}	2024-12-11 19:56:17.764186	2024-12-11 19:56:17.764186
c080c960-d5e2-4bf4-bf70-a01e43c7af12	Help the Farmer	Help the farmer repair the fence.	{"coins": 200}	2024-12-11 19:56:17.764186	2024-12-11 19:56:17.764186
863ad22a-07f2-451a-8fd3-978e443718c2	Find the Lost Ring	Find the lost ring in the river.	{"item": "golden_ring", "coins": 300}	2024-12-11 19:56:17.764186	2024-12-11 19:56:17.764186
10163c70-ea92-46bf-9275-75bdceb482db	Guard the Village	Protect the village from bandits.	{"item": "guard_sword", "coins": 400}	2024-12-11 19:56:17.764186	2024-12-11 19:56:17.764186
\.


--
-- TOC entry 4926 (class 0 OID 16480)
-- Dependencies: 220
-- Data for Name: user_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_tasks (id, user_id, task_id, status, start_time, end_time, progress, reward_claimed) FROM stdin;
3dcd977d-a94e-4f2b-a8a0-8a9ddffe2aaf	36ae86c8-a1a4-4709-aed7-9d8ecc5b2db3	0e92e27e-5977-47d4-89cc-880be7d56c61	completed	2024-12-10 19:56:17.764186	2024-12-10 20:56:17.764186	{"required": 10, "collected": 10}	t
a09b5d44-4147-458a-905a-8d48fe87b599	36ae86c8-a1a4-4709-aed7-9d8ecc5b2db3	8790074e-e4e9-4e2e-b401-ac8989b8b9a4	in_progress	2024-12-11 16:56:17.764186	\N	{"required": 1, "collected": 1}	f
683e0cff-35fa-4e2a-83c7-599dae9af800	3c7ae9ea-0f6a-451a-9890-cede2baf721b	c080c960-d5e2-4bf4-bf70-a01e43c7af12	completed	2024-12-09 19:56:17.764186	2024-12-10 19:56:17.764186	{"progress": "fence_repaired"}	t
576e5695-6ab0-4b72-aae2-4f4f7860a78e	61f2067f-c7b0-4716-8083-7faa326816c6	863ad22a-07f2-451a-8fd3-978e443718c2	in_progress	2024-12-11 14:56:17.764186	\N	{"found": 0, "required": 1}	f
c8639bd3-3565-4cf9-aee1-1677e7316dc1	1e9b22b6-cc1f-4ef0-a7d7-995b8ff06466	10163c70-ea92-46bf-9275-75bdceb482db	in_progress	2024-12-11 18:56:17.764186	\N	{"required": 10, "defeated_bandits": 3}	f
\.


--
-- TOC entry 4924 (class 0 OID 16454)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, is_guest, progress, logout_position, created_at, updated_at, password_hash, level, exp, hp) FROM stdin;
3c7ae9ea-0f6a-451a-9890-cede2baf721b	player2	f	{"level": 5, "experience": 500}	{}	2024-12-11 19:56:17.764186	2024-12-17 17:59:08.749987	$2a$06$ST0eYqx6cW2z4zGE1J0QK.0l3FbMphpSC5tD3j78sHpPawluJ68uC	1	0	100
61f2067f-c7b0-4716-8083-7faa326816c6	player3	f	{"level": 8, "experience": 1200}	{"x": 120, "y": 220}	2024-12-11 19:56:17.764186	2024-12-11 19:56:17.764186	$2a$06$om8BARBRMTJJLV39TWHdEO7NigAfRbzV9Xn4NbEl3nNIT58En9sCi	1	0	100
1e9b22b6-cc1f-4ef0-a7d7-995b8ff06466	player4	f	{"level": 12, "experience": 1800}	{"x": 300, "y": 400}	2024-12-11 19:56:17.764186	2024-12-11 19:56:17.764186	$2a$06$Kd1ulhiTsZ0.0MfjV4M4cuNqNZH/8Cw.Nq6PJY26txnZbVRZ05jWy	1	0	100
595d5ccd-7048-4c61-b830-ae878bf9da0b	Guest114	t	{}	{"x": 0, "y": 0}	2024-12-13 14:54:06.276028	2024-12-13 14:54:06.276028	\N	1	0	100
1880f884-9744-4ab1-9fe2-e841e62d2a94	Guest875	t	{}	{"x": 0, "y": 0}	2024-12-14 11:50:56.398826	2024-12-14 11:50:56.398826	\N	1	0	100
05046904-5298-45a2-96fa-27a052e55e8f	Guest357	t	{}	{"x": 0, "y": 0}	2024-12-14 11:56:15.388621	2024-12-14 11:56:15.388621	\N	1	0	100
f066f664-7380-41f3-bc0d-23d50d3d9ab8	Guest220	t	{}	{"x": 0, "y": 0}	2024-12-14 12:19:18.571697	2024-12-14 12:19:18.571697	\N	1	0	100
b6da4bc3-3881-49db-9835-ada3964f9c40	Guest051	t	{}	{"x": 0, "y": 0}	2024-12-14 12:33:25.830793	2024-12-14 12:33:25.830793	\N	1	0	100
23076bac-ac06-4536-a777-8b8d0fa028da	Guest820	t	{}	{"x": 0, "y": 0}	2024-12-14 12:34:39.447315	2024-12-14 12:34:39.447315	\N	1	0	100
2cc95395-d6f8-4bad-adb8-4e3769c2043c	Guest461	t	{}	{"x": 0, "y": 0}	2024-12-14 13:16:13.706516	2024-12-14 13:16:13.706516	\N	1	0	100
fd3ccf18-0b31-46ab-8e74-e3915590a505	Guest837	t	{}	{"x": 0, "y": 0}	2024-12-14 13:17:55.695641	2024-12-14 13:17:55.695641	\N	1	0	100
0e04eff2-b254-47e8-9640-cb88b096a3b8	Guest267	t	{}	{"x": 0, "y": 0}	2024-12-14 13:21:34.080402	2024-12-14 13:21:34.080402	\N	1	0	100
977ef246-a182-4b56-bc3d-f256a64d947b	Guest053	t	{}	{"x": 0, "y": 0}	2024-12-14 13:24:10.507046	2024-12-14 13:24:10.507046	\N	1	0	100
1be8aa36-8008-48b2-9e52-2eb97622c5f5	Guest717	t	{}	{"x": 0, "y": 0}	2024-12-14 13:25:12.860395	2024-12-14 13:25:12.860395	\N	1	0	100
ef9e5cf4-f470-42a7-a63a-9d13151d80d5	Guest846	t	{}	{"x": 0, "y": 0}	2024-12-14 13:26:52.301776	2024-12-14 13:26:52.301776	\N	1	0	100
0e3217cc-4e18-4225-bea6-29dddfd83790	Guest892	t	{}	{"x": 0, "y": 0}	2024-12-14 13:54:21.225995	2024-12-14 13:54:21.225995	\N	1	0	100
3266aede-9bde-4611-ad8b-9cab3e5a1175	Guest060	t	{}	{"x": 0, "y": 0}	2024-12-14 13:58:12.387896	2024-12-14 13:58:12.387896	\N	1	0	100
c9198afe-0bb0-4284-be23-348beadb349b	Guest330	t	{}	{"x": 0, "y": 0}	2024-12-14 14:01:44.719638	2024-12-14 14:01:44.719638	\N	1	0	100
3cd0198f-731d-485e-b62a-7943a8a40946	Guest884	t	{}	{"x": 0, "y": 0}	2024-12-14 14:03:31.152251	2024-12-14 14:03:31.152251	\N	1	0	100
b88272da-14a4-454f-abdc-9be6a109221e	Guest130	t	{}	{"x": 0, "y": 0}	2024-12-14 14:04:08.265691	2024-12-14 14:04:08.265691	\N	1	0	100
0345aff6-e300-4f83-8aab-5813209c372c	Guest136	t	{}	{"x": 0, "y": 0}	2024-12-16 11:28:09.693663	2024-12-16 11:28:09.693663	\N	1	0	100
c9bae119-1d29-4e86-82ae-e391f259bd69	Guest505	t	{}	{"x": 0, "y": 0}	2024-12-16 11:32:24.255742	2024-12-16 11:32:24.255742	\N	1	0	100
056579c8-efcb-47f3-b277-f79e3d3dc2ef	Guest162	t	{}	{"x": 0, "y": 0}	2024-12-16 11:33:24.462116	2024-12-16 11:33:24.462116	\N	1	0	100
759b8938-748d-45b3-b645-ff19b8728c82	Guest171	t	{}	{"x": 0, "y": 0}	2024-12-16 11:39:05.046385	2024-12-16 11:39:05.046385	\N	1	0	100
2e389896-9a02-474a-a254-81bcfec6c201	Guest555	t	{}	{"x": 0, "y": 0}	2024-12-16 11:40:50.120401	2024-12-16 11:40:50.120401	\N	1	0	100
eac600ca-9265-4252-ba9b-456ab76015e3	Guest0291	t	{}	{"x": 0, "y": 0}	2024-12-16 11:48:54.147089	2024-12-16 11:48:54.147089	\N	1	0	100
5615bab1-aae4-4e26-955a-bbcf7910964c	Guest0822	t	{}	{"x": 0, "y": 0}	2024-12-16 12:17:28.716975	2024-12-16 12:17:28.716975	\N	1	0	100
e6678021-a658-43fc-a0a9-bb699fb12396	Guest0999	t	{}	{"x": 0, "y": 0}	2024-12-16 12:17:52.487692	2024-12-16 12:17:52.487692	\N	1	0	100
331d39ce-fb49-4519-ab32-3083be1bbd78	Guest0148	t	{}	{"x": 0, "y": 0}	2024-12-16 12:33:43.778919	2024-12-16 12:33:43.778919	\N	1	0	100
f539b03f-0180-4fe0-97df-a7a7c3188950	Guest0897	t	{}	{"x": 0, "y": 0}	2024-12-16 12:34:40.317727	2024-12-16 12:34:40.317727	\N	1	0	100
2287c035-8ab2-411e-a4dc-ca3fca627c15	Guest0816	t	{}	{"x": 0, "y": 0}	2024-12-16 12:37:52.221063	2024-12-16 12:37:52.221063	\N	1	0	100
36ae86c8-a1a4-4709-aed7-9d8ecc5b2db3	player1	f	{"level": 10, "experience": 1500}	{}	2024-12-11 19:56:17.764186	2024-12-17 18:26:14.018619	$2a$06$MKpNCavphaGKa9bF/GhmzeEMsWieZguwnJUNuRCEp1yPs0NjC.AeW	4	0	100
03561ed6-7487-4e5e-af12-67250bb38ea1	Guest0522	t	{}	{"x": 0, "y": 0}	2024-12-16 12:39:49.224561	2024-12-16 12:39:49.224561	\N	1	0	100
1a7d5880-8bb4-4b15-a190-218490599bd0	Guest0683	t	{}	{"x": 0, "y": 0}	2024-12-16 12:49:18.532604	2024-12-16 12:49:18.532604	\N	1	0	100
eb514872-66c5-4f80-8983-1317f4209870	Guest0491	t	{}	{"x": 0, "y": 0}	2024-12-16 12:51:39.300529	2024-12-16 12:51:39.300529	\N	1	0	100
9a2b9e78-211c-46ea-9b9c-1d80865c2df8	Guest0849	t	{}	{"x": 0, "y": 0}	2024-12-16 12:54:21.978024	2024-12-16 12:54:21.978024	\N	1	0	100
bf8e4a03-7295-4712-8016-721610675555	Guest0078	t	{}	{"x": 0, "y": 0}	2024-12-16 13:03:07.818784	2024-12-16 13:03:07.818784	\N	1	0	100
f4acd8b2-1420-4032-b512-ee7b2321558f	Guest0954	t	{}	{"x": 0, "y": 0}	2024-12-16 13:03:41.193839	2024-12-16 13:03:41.193839	\N	1	0	100
dcd32399-3a68-4aaa-b8cc-c875caa6b708	Guest0188	t	{}	{"x": 0, "y": 0}	2024-12-16 13:17:21.010944	2024-12-16 13:17:21.010944	\N	1	0	100
64634cf0-83de-4966-956e-e9b2751c0771	Guest0469	t	{}	{"x": 0, "y": 0}	2024-12-16 13:19:17.4019	2024-12-16 13:19:17.4019	\N	1	0	100
656a4cca-c94f-41c9-ae3b-ab33db27b07b	Guest0041	t	{}	{"x": 0, "y": 0}	2024-12-16 13:37:10.305904	2024-12-16 13:37:10.305904	\N	1	0	100
795852a7-87c9-4d67-a431-dc45608a8c7d	Guest0204	t	{}	{"x": 0, "y": 0}	2024-12-16 13:39:20.243275	2024-12-16 13:39:20.243275	\N	1	0	100
7fde58f4-12ec-46e3-8c88-7569bfa54007	Guest0339	t	{}	{"x": 0, "y": 0}	2024-12-16 14:14:44.802259	2024-12-16 14:14:44.802259	\N	1	0	100
2375f22a-b93b-47e9-baa4-608bc408ed96	Guest0006	t	{}	{"x": 0, "y": 0}	2024-12-16 15:59:57.506716	2024-12-16 15:59:57.506716	\N	1	0	100
f501eedc-4722-41a0-8896-f5b77f0b7488	Guest0121	t	{}	{"x": 0, "y": 0}	2024-12-16 16:02:41.467473	2024-12-16 16:02:41.467473	\N	1	0	100
3671465d-4b13-42e8-aabb-47435c89bfc2	Guest0947	t	{}	{"x": 0, "y": 0}	2024-12-16 16:34:53.499491	2024-12-16 16:34:53.499491	\N	1	0	100
bd277c56-2ba2-4192-aa6c-0afc6d78e21a	Guest0057	t	{}	{"x": 0, "y": 0}	2024-12-16 16:35:41.90757	2024-12-16 16:35:41.90757	\N	1	0	100
\.


--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 221
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_id_seq', 1, false);


--
-- TOC entry 4776 (class 2606 OID 16553)
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- TOC entry 4772 (class 2606 OID 16479)
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4774 (class 2606 OID 16491)
-- Name: user_tasks user_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_tasks
    ADD CONSTRAINT user_tasks_pkey PRIMARY KEY (id);


--
-- TOC entry 4768 (class 2606 OID 16466)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4770 (class 2606 OID 16468)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4777 (class 2606 OID 16497)
-- Name: user_tasks user_tasks_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_tasks
    ADD CONSTRAINT user_tasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- TOC entry 4778 (class 2606 OID 16492)
-- Name: user_tasks user_tasks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_tasks
    ADD CONSTRAINT user_tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2024-12-17 19:20:31

--
-- PostgreSQL database dump complete
--

