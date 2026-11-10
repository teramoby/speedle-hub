# Speedle Terminology Glossary (i18n)

This glossary defines standard translations for Japanese (ja), Korean (ko) and Spanish (es), cross-referenced with English (en) and Chinese (zh-CN). It is used across all Speedle repositories:
- `teramoby/speedle-hub` (speedle.io)
- `teramoby/speedle-plus` (engine.speedle.io)
- `teramoby/ai.speedle.io` (ai.speedle.io)
- `teramoby/cloud.speedle.io` (cloud.speedle.io)

---

## General Rules

1. **Untranslated items:** Product names (`Speedle`, `Speedle Engine`, `Speedle Cloud`, `Speedle AI`), policy language name (`SPDL`), CLI commands (`spctl`, `speedle-mcp`, `npm`, `npx`), code, API endpoints (`POST /authz-check/v1/is-allowed`, `IsAllowed`), package names (`@speedle/sdk`, `@speedle/mcp`), programming language names (`Go`, `Python`, `Java`, `C#/.NET`, `Rust`, `Node.js`), and protocol/standard names (`UPL 1.0`, `REST`, `gRPC`, `stdio`) stay in English across all languages. Code samples, including comments inside them, are copied unchanged.
2. **Punctuation in titles and UI labels:** Titles, headings, hero titles, card titles, eyebrow labels, button labels, and navigation labels must not end with a full stop (`.` or `。`) in any language. Body sentences and meta descriptions retain standard punctuation.
3. **Cross-site links:** Links from a localized page to other Speedle sites point to the counterpart page in the same language if it exists; otherwise they use the English page. Engine, Cloud and AI currently publish English and Chinese only, so Japanese, Korean and Spanish pages link to those sites in English.
4. **Acronyms:** Standard security acronyms (`RBAC`, `ABAC`, `PMS`, `ADS`, `MCP`, `SDK`, `RAG`, `A2A`, `ZSP`) retain their Latin uppercase forms, optionally followed or preceded by the localized explanation on first mention.

---

## 1. Product Names & Brand Marks

| Term (en) | Chinese (zh-CN) | Japanese (ja) | Korean (ko) | Spanish (es) | Notes / Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Speedle** | Speedle | Speedle | Speedle | Speedle | Keep in English |
| **Speedle Engine** | Speedle Engine | Speedle Engine | Speedle Engine | Speedle Engine | Keep in English |
| **Speedle Cloud** | Speedle Cloud | Speedle Cloud | Speedle Cloud | Speedle Cloud | Keep in English |
| **Speedle AI** | Speedle AI | Speedle AI | Speedle AI | Speedle AI | Keep in English |
| **The Speedle family** | Speedle 产品家族 | Speedle ファミリー | Speedle 패밀리 | La familia Speedle | Family of products |
| **SPDL** | SPDL | SPDL | SPDL | SPDL | Speedle Policy Definition Language; keep in English |
| **spctl** | spctl | spctl | spctl | spctl | CLI binary name; keep in English |
| **@speedle/sdk** | @speedle/sdk | @speedle/sdk | @speedle/sdk | @speedle/sdk | npm package name; keep in English |
| **@speedle/mcp** | @speedle/mcp | @speedle/mcp | @speedle/mcp | @speedle/mcp | npm package name; keep in English |
| **Universal Permissive License v1.0 (UPL 1.0)** | Universal Permissive License v1.0 (UPL 1.0) | Universal Permissive License v1.0 (UPL 1.0) | Universal Permissive License v1.0 (UPL 1.0) | Universal Permissive License v1.0 (UPL 1.0) | License name; keep official English title |

---

## 2. Architecture, Services & Core Technical Terms

| Term (en) | Chinese (zh-CN) | Japanese (ja) | Korean (ko) | Spanish (es) | Notes / Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **authorization** | 授权 | 認可 | 인가 | autorización | Distinction: authentication = 認証/인증/autenticación |
| **access control** | 访问控制 | アクセス制御 | 접근 제어 | control de acceso | Broad access control concept |
| **authorization engine** | 授权引擎 | 認可エンジン | 인가 엔진 | motor de autorización | Core system description |
| **policy** | 策略 | ポリシー | 정책 | política | Individual rule or statement |
| **policy model** | 策略模型 | ポリシーモデル | 정책 모델 | modelo de políticas | The conceptual abstraction |
| **policy language** | 策略语言 | ポリシー言語 | 정책 언어 | lenguaje de políticas | Domain-specific language (SPDL) |
| **authorization decision** | 授权决策 | 認可決定 | 인가 결정 | decisión de autorización | Decision returned by ADS / IsAllowed |
| **authorization check** | 授权检查 | 認可チェック | 인가 확인 | comprobación de autorización | Action of checking permissions |
| **Policy Management Service (PMS)** | 策略管理服务（PMS） | ポリシー管理サービス (PMS) | 정책 관리 서비스(PMS) | Servicio de Gestión de Políticas (PMS) | Speedle PMS component |
| **Authorization Decision Service (ADS)** | 授权决策服务（ADS） | 認可決定サービス (ADS) | 인가 결정 서비스(ADS) | Servicio de Decisiones de Autorización (ADS) | Speedle ADS component |
| **IsAllowed API** | IsAllowed API | IsAllowed API | IsAllowed API | API IsAllowed | Core query endpoint; name untranslated |
| **role** | 角色 | ロール | 역할 | rol | RBAC identity grouping |
| **user** | 用户 | ユーザー | 사용자 | usuario | Subject in policy |
| **service** | 服务 | サービス | 서비스 | servicio | Protected service / target domain |
| **token** | 令牌 | トークン | 토큰 | token | API authentication token |
| **console** | 控制台 | コンソール | 콘솔 | consola | Policy and service management UI |
| **sign-in** | 登录 | ログイン | 로그인 | inicio de sesión | Account sign-in |
| **demo** | 演示 | デモ | 데모 | demostración | Sample-data demonstration |
| **request model** | 请求模型 | リクエストモデル | 요청 모델 | modelo de solicitud | Shared authorization request shape |
| **decision semantics** | 决策语义 | 決定セマンティクス | 결정 체계 | semántica de decisión | Meaning of allow and deny |
| **RBAC** | RBAC | RBAC | RBAC | RBAC | Role-Based Access Control |
| **ABAC** | ABAC | ABAC | ABAC | ABAC | Attribute-Based Access Control |
| **Playground** | Playground | プレイグラウンド | 플레이그라운드 | Playground | Interactive policy test environment |
| **SDK / SDKs** | SDK | SDK | SDK | SDK | Software Development Kit |
| **CLI** | CLI | CLI | CLI | CLI | Command-line interface |

---

## 3. AI, Agents & Integration Terminology

| Term (en) | Chinese (zh-CN) | Japanese (ja) | Korean (ko) | Spanish (es) | Notes / Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AI agent** | AI 智能体 | AI エージェント | AI 에이전트 | agente de IA | Autonomous AI system |
| **agent** | 智能体 | エージェント | 에이전트 | agente | Short form for AI agent |
| **Agent Skill / skill** | Agent Skill / 技能 | エージェントスキル / スキル | 에이전트 스킬 / 스킬 | habilidad de agente / skill | Capability module for AI agents |
| **policy modeler** | 策略建模 | ポリシーモデラー | 정책 모델러 | modelador de políticas | Speedle AI modeler agent / skill |
| **MCP (Model Context Protocol)** | MCP | MCP | MCP | MCP | Open protocol by Anthropic; keep acronym |
| **MCP server** | MCP 服务器 | MCP サーバー | MCP 서버 | servidor MCP | Server exposing tools/resources via MCP |
| **tool call / tool calls** | 工具调用 | ツール呼び出し | 도구 호출 | llamadas a herramientas | LLM tool invocations |
| **permission-aware RAG** | 权限感知的 RAG | 権限を考慮した RAG | 권한 인식 RAG | RAG con reconocimiento de permisos | Retrieval-Augmented Generation with ACL |
| **agent-to-agent calls (A2A)** | 智能体间调用（A2A） | エージェント間呼び出し (A2A) | 에이전트 간 호출(A2A) | llamadas de agente a agente (A2A) | Inter-agent communication |
| **zero standing privileges (ZSP)** | 零常驻权限（ZSP） | 常設特権ゼロ (ZSP) | 상시 권한 배제(ZSP) | privilegios permanentes cero (ZSP) | Just-in-time privilege model |
| **solution patterns** | 解决方案模式 | ソリューションパターン | 솔루션 패턴 | patrones de solución | Architectural reference patterns |
| **handbook** | 员工手册 | マニュアル | 지침서 | manual | Source document for policy modeling |
| **regulation** | 法规 | 規程 | 규정 | normativa | Source document for policy modeling |
| **data and training** | 数据与训练 | データとトレーニング | 데이터 및 학습 | datos y entrenamiento | AI pattern area |
| **model release** | 模型发布 | モデルリリース | 모델 배포 | publicación de modelos | AI pattern area |

---

## 4. Product Stages, Operations & Hosting

| Term (en) | Chinese (zh-CN) | Japanese (ja) | Korean (ko) | Spanish (es) | Notes / Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **open source** | 开源 | オープンソース | 오픈 소스 | código abierto | Licensing model |
| **self-hosted** | 自托管 | セルフホスト | 자체 호스팅 | autohospedado | Infrastructure model |
| **hosted** | 托管 | ホスト型 | 호스팅형 | hospedado | Managed cloud service model |
| **preview** | 预览 | プレビュー | 프리뷰 | vista previa | Pre-launch state label |
| **launch preview** | 发布预览 | ローンチプレビュー | 출시 프리뷰 | vista previa de lanzamiento | MCP / product early milestone |
| **coming soon** | 即将上线 | まもなく公開 | 출시 예정 | próximamente | Upcoming feature or service badge |
| **free public beta / free beta** | 免费公测 | 無料パブリックベータ | 무료 공개 베타 | beta pública gratuita | Speedle Cloud initial access tier |
| **documentation / docs** | 文档 | ドキュメント | 문서 | documentación | Technical documentation |
| **release notes** | 版本说明 | リリースノート | 릴리스 노트 | notas de la versión | Release changelog |

---

## 5. UI Elements, Buttons & Navigation

| Term (en) | Chinese (zh-CN) | Japanese (ja) | Korean (ko) | Spanish (es) | Notes / Rule |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Products** | 产品 | プロダクト | 제품 | Productos | Header menu dropdown |
| **Docs** | 文档 | ドキュメント | 문서 | Documentación | Header link |
| **SDKs** | SDK | SDK | SDK | SDK | Header link |
| **Language** | 语言 | 言語 | 언어 | Idioma | Language switcher title |
| **Switch to [Language]** | 切换到[语言] | [言語]に切り替える | [언어]로 변경 | Cambiar a [idioma] | Switcher accessible label |
| **Explore the products** | 了解三个产品 | プロダクトを見る | 제품 살펴보기 | Explorar los productos | Hero CTA button (no trailing dot) |
| **View on GitHub** | 在 GitHub 上查看 | GitHub で見る | GitHub에서 보기 | Ver en GitHub | Hero secondary button (no trailing dot) |
| **Get started with the Engine** | 开始使用 Speedle Engine | Speedle Engine をはじめる | Speedle Engine 시작하기 | Comenzar con Speedle Engine | Card CTA link |
| **Explore Speedle Cloud** | 了解 Speedle Cloud | Speedle Cloud を見る | Speedle Cloud 살펴보기 | Explorar Speedle Cloud | Card CTA link |
| **Explore Speedle AI** | 了解 Speedle AI | Speedle AI を見る | Speedle AI 살펴보기 | Explorar Speedle AI | Card CTA link |
| **Try the policy modeler skill** | 试用策略建模技能 | ポリシーモデラースキルを試す | 정책 모델러 스킬 체험하기 | Probar la habilidad de modelado de políticas | Card sublink |
| **Cloud documentation** | Cloud 文档 | Cloud ドキュメント | Cloud 문서 | Documentación de Cloud | Card sublink |
| **Read the SPDL reference** | 阅读 SPDL 参考 | SPDL リファレンスを読む | SPDL 레퍼런스 읽기 | Leer la referencia de SPDL | Text link |
| **SDK documentation** | SDK 文档 | SDK ドキュメント | SDK 문서 | Documentación de SDK | Connect card link |
| **SDK source** | SDK 源码 | SDK ソースコード | SDK 소스 코드 | Código fuente de SDK | Connect card link |
| **MCP repository** | MCP 仓库 | MCP リポジトリ | MCP 저장소 | Repositorio de MCP | Connect card link |
| **MCP overview** | MCP 概览 | MCP 概要 | MCP 개요 | Descripción general de MCP | Connect card link |
| **Skip to content** | 跳到正文 | コンテンツへスキップ | 본문으로 건너뛰기 | Saltar al contenido | Accessibility skip link |
| **Open navigation** | 打开导航 | ナビゲーションを開く | 내비게이션 열기 | Abrir navegación | Mobile hamburger button label |
| **Close navigation** | 关闭导航 | ナビゲーションを閉じる | 내비게이션 닫기 | Cerrar navegación | Mobile menu close button label |
| **Page not found** | 页面不存在 | ページが見つかりません | 페이지를 찾을 수 없습니다 | Página no encontrada | 404 page title (no trailing dot) |
| **English home** | 英文首页 | 英語ホーム | 영어 홈 | Inicio en inglés | 404 link button (no trailing dot) |
| **All rights reserved** | 版权所有 | All rights reserved | All rights reserved | Todos los derechos reservados | Copyright footer statement |
| **Community links** | 社区链接 | コミュニティリンク | 커뮤니티 링크 | Enlaces de la comunidad | Footer social navigation label |
