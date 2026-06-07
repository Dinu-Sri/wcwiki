# wcWIKI Future-Proof Expansion Roadmap

> **Document purpose**: This roadmap lists the features, UX/UI improvements, data structures, review systems, retention tactics, and phased implementation strategy needed to make wcWIKI difficult for generic AI chatbots to replace.
>
> **Strategic goal**: Transform wcWIKI from a watercolor encyclopedia/search engine into a **living watercolor knowledge system**: encyclopedia + visual evidence lab + material database + review platform + personal studio tools + community learning system + source-grade citation platform.
>
> **Prepared for**: wcWIKI.org development planning  
> **Input basis**: Existing wcWIKI system overview, current live features, known gaps, and the AI-resilience strategy discussed for building the world's first watercolor Wikipedia.
>
> **Core principle**: Do not compete with AI on short text answers. Compete through **verified visual evidence, structured watercolor data, personal tools, community trust, expert review, and original experiments**.

---

## 0. Strategic Positioning

### 0.1 The current risk

A normal watercolor article site can be summarized by AI:

- "What is granulation?"
- "What is cold press paper?"
- "Who was John Singer Sargent?"
- "What are warm and cool colors?"
- "What is wet-on-wet technique?"

These questions are answer-grade. AI can satisfy many users without sending them to the original site.

### 0.2 The future-proof direction

wcWIKI should become a place where users do things AI cannot fully deliver:

- Compare real pigment behavior using verified swatch images
- Save their own palette, papers, brushes, and learning notes
- Upload their own tests and receive community/expert feedback
- Review watercolor papers, pigments, brands, brushes, books, courses, and tools
- Explore standardized visual experiments
- Follow structured learning paths
- Cite stable, reviewed, versioned watercolor knowledge pages
- Ask a wcWIKI AI assistant that answers from verified wcWIKI sources and pushes users back into interactive tools

### 0.3 One-line product vision

> **wcWIKI is the world's living watercolor knowledge system where watercolor knowledge is tested, visualized, compared, reviewed, cited, personalized, and improved by artists.**

### 0.4 The AI-resistance moat

| Moat | Why AI cannot easily replace it | How wcWIKI should implement it |
|---|---|---|
| Original visual tests | AI can describe pigment behavior, but cannot replace verified real-world swatches across brands and papers | Standardized swatch lab, uploads, comparison grids, test protocols |
| Personal user data | External AI does not know each artist's paints, papers, swatches, studies, and learning progress | My Palette, My Paper Shelf, My Brush Rack, My Swatch Book, My Learning Path |
| Community trust | AI gives answers without social proof; artists trust other artists' tested experience | Reviews, comments, contributor reputation, artist verification, expert review |
| Versioned citations | Serious learners, educators, and writers need citable sources | Stable URLs, citation styles, version history, reviewer labels |
| Interactive tools | AI answer is static; tools keep users inside the platform | Pigment substitute finder, palette builder, material comparison, mixing explorer |
| Verified review ecosystem | Product reviews and paper/pigment tests require human experience | Review system for papers, pigments, brands, brushes, books, courses |
| Learning continuity | AI answers one question at a time; wcWIKI can guide a complete journey | Learning paths, progress tracking, practice tasks, challenges |
| Multilingual community | AI translates, but does not build trusted multilingual art communities | Existing translation workflow + localized community moderation |
| Source-grade database | AI uses source material; wcWIKI should become the source | Structured material database, public API, references, expert-reviewed pages |

---

## 1. Implementation Method

### 1.1 Additive development rule

All future work should be additive and should not break the current public encyclopedia flow.

Current wcWIKI already has:

- Artist pages
- Painting pages
- Article pages
- Search
- Translations
- User accounts
- Editor/Approver/Super Admin roles
- Media library
- Edit proposals
- Suggestions
- Notifications
- Public API
- SEO and JSON-LD
- Meilisearch indexing

Therefore, new features should be added as:

- New entity types
- New tabs inside existing pages
- New dashboard modules
- New public comparison pages
- New API endpoints
- New review workflows
- New visual evidence components
- New retention-focused user features

Avoid rewriting the core system unless required for stability or data safety.

### 1.2 UX principle

Every high-value page should answer three questions:

1. **What is this?**  
   Basic encyclopedia explanation.

2. **How does it behave visually?**  
   Swatches, images, tests, comparisons.

3. **How does it help me personally?**  
   Save, compare, review, add to palette, try exercise, follow, cite.

### 1.3 Page-level retention formula

Each page should contain at least three retention hooks:

- Save action: "Add to My Palette", "Add to My Paper Shelf", "Save to Collection"
- Compare action: "Compare with another pigment/paper/brand"
- Contribution action: "Upload your swatch", "Write a review", "Suggest correction"
- Learning action: "Try this exercise", "Add to learning path"
- Trust action: "View tested evidence", "View reviewer notes", "Cite this page"
- Discovery action: "Related pigments", "Common mixes", "Used by artists", "Similar materials"

---

## 2. Priority Roadmap Overview

| Phase | Priority | Name | Main Purpose | Retention Value | AI-Resistance Value |
|---|---:|---|---|---|---|
| Phase 0 | Critical | Stability and Data Safety | Fix production risks before adding major features | Protect existing user/content trust | Prevent data loss and stale search |
| Phase 1 | Critical | Watercolor Knowledge Taxonomy | Add core entity types: pigments, papers, brands, brushes, techniques | Gives users more browsing depth | Builds structured data AI cannot easily reproduce |
| Phase 2 | Very High | Visual Evidence Lab | Standardized swatches, paper tests, brand comparisons | Visual browsing, repeated visits | Original experimental evidence |
| Phase 3 | Very High | Review and Rating System | Reviews for papers, pigments, brands, brushes, books, courses | User-generated content loop | Human experience + social proof |
| Phase 4 | Very High | Personal Studio Tools | My Palette, My Papers, My Swatches, My Notes | Strong account retention | Personal context outside public AI |
| Phase 5 | High | Comparison and Decision Tools | Compare pigments, papers, brands, palettes | Practical utility | Interactive tools beat static AI answers |
| Phase 6 | High | Citation, Versioning, and Source Authority | Make wcWIKI citable and academically trustworthy | Educator/researcher retention | Source-grade authority |
| Phase 7 | High | Community Contribution System 2.0 | Challenges, comments, discussions, contributor profiles | Community habit formation | Network/community moat |
| Phase 8 | High | wcWIKI AI Assistant | AI inside wcWIKI using verified content | Keeps AI users inside platform | Turns AI into navigation layer |
| Phase 9 | Medium | Learning Paths and Courses | Structured watercolor learning journeys | Long-term learning retention | Ongoing guided experience |
| Phase 10 | Medium | Advanced Discovery and Visual Search | Related content, visual similarity, advanced faceted search | Deep exploration | Better discovery than generic AI |
| Phase 11 | Medium | Partnerships, API, and External Embeds | Let educators/brands link to wcWIKI data | Authority and backlinks | Become infrastructure |
| Phase 12 | Medium | Monetization and Sustainability | Premium tools, institutional accounts, sponsorships | Financial retention | Supports long-term survival |

---

## 3. Phase 0 — Critical Stability and Data Safety

### 3.1 Why this comes first

Before building AI-resistant features, wcWIKI must protect its existing content, users, and production system. The current overview indicates some high-priority stability gaps such as database migration risks, lack of automated backups, lack of automated tests, and no continuous Meilisearch sync.

> **🟢 Phase 0 Status (2026-06-07)**: 2 of 4 items implemented, 1 validated as non-issue, 1 deferred.
> See details below.

### 3.2 Required additions

#### 3.2.1 Safe database migration workflow ✅ DONE (2026-06-07)

**Goal**: Remove production risk from automatic `prisma db push --accept-data-loss`.

**Additions**:

- Replace container-start `db push --accept-data-loss` with controlled `prisma migrate deploy`
- Add migration checklist before deployment
- Add database backup before migration
- Add schema change review process
- Add staging database for testing migrations
- Add migration rollback documentation
- Add production migration logs to admin dashboard

**UX/UI**:

- Super Admin > System Health > Database Status
- Show:
  - Current schema version
  - Last migration date
  - Last backup date
  - Pending migration count
  - Migration risk level
  - Backup download link for admins

**Retention benefit**:

- Users trust a platform that does not lose contributions, reviews, images, or swatches.

#### 3.2.2 Automated backups ✅ DONE (2026-06-07)

**Goal**: Protect all user-generated knowledge.

**Additions**:

- Daily PostgreSQL dump
- Weekly full backup including R2 media manifest
- Backup retention policy:
  - Daily: 14 days
  - Weekly: 8 weeks
  - Monthly: 12 months
- Restore test once per month
- Admin notification if backup fails

**UX/UI**:

- Admin card:
  - "Last successful backup: date/time"
  - "Backup size"
  - "Restore test status"
  - Red warning if no backup in last 24 hours

#### 3.2.3 Continuous search sync ❌ NOT NEEDED (already event-driven)

**Audit finding (2026-06-07)**: Meilisearch is already synced incrementally via
`src/lib/search/sync.ts`. The `syncArtist()`, `syncPainting()`, `syncArticle()`,
and `syncSuggestions()` functions are called from 6 API route handlers on every
create/update/approve action. The full reindex on container start is a safety net,
not the primary sync mechanism. No changes needed.

**Goal**: New articles, reviews, pigments, papers, and swatches should appear in search immediately.

**Additions**:

- Event-driven Meilisearch indexing after create/update/delete
- Reindex queue for failed sync jobs
- Admin "Search Index Health" panel
- Index status per entity:
  - Indexed
  - Waiting
  - Failed
  - Reindex required

**UX/UI**:

- After publishing content: "Published and indexed"
- If search sync fails: "Published, but search indexing is pending"

#### 3.2.4 Basic automated tests ⏳ DEFERRED (not blocking stability)

**Audit finding (2026-06-07)**: Zero test infrastructure exists. No Jest, Vitest,
or Playwright in dependencies. GitHub Actions already validates lint + build.
Adding tests is important but does not block production stability.
Deferred to be implemented alongside Phase 1 (new entity types need test coverage).

**Goal**: Prevent breakage as new features increase complexity.

**Test coverage to add first**:

- Auth registration/login
- Search
- Article creation
- Edit proposal approval
- Translation approval
- Image upload
- API key access
- Admin access protection
- Future review submission
- Future swatch upload

**Retention benefit**:

- Stable contribution systems keep editors and users engaged.

---

## 4. Phase 1 — Watercolor Knowledge Taxonomy

### 4.1 Purpose

The current system has artists, paintings, and articles. To become a watercolor knowledge system, wcWIKI needs structured watercolor-specific entities.

### 4.2 New core entity types

#### 4.2.1 Pigment

A pigment page should represent a pigment identity, not just a brand product.

**Examples**:

- PB29 Ultramarine Blue
- PY150 Nickel Azo Yellow
- PR122 Quinacridone Magenta
- PBr7 Burnt Sienna / Raw Umber family
- PG7 Phthalo Green

**Fields**:

- Pigment code
- Common names
- Chemical family
- Color family
- Warm/cool tendency
- Transparency
- Staining strength
- Granulation level
- Lightfastness summary
- Toxicity/safety notes
- Historical use
- Common watercolor uses
- Common mixing partners
- Related pigments
- Substitute pigments
- Known brand variations
- Images/swatch references
- References
- Reviewer notes
- Version history

**UX/UI**:

- Pigment identity card at top
- Large swatch hero image
- "Add to My Palette"
- "Compare Pigment"
- "Find Substitute"
- "View Mixes"
- "Upload Swatch"
- "Review Pigment"
- "Cite This Page"

**Retention tactics**:

- Users return to pigment pages when buying paints or planning palettes.
- "Add to My Palette" encourages account creation.
- Substitute and comparison tools create repeat usage.

#### 4.2.2 Paint/Product

A paint/product page should represent a specific commercial watercolor paint.

**Examples**:

- Daniel Smith Ultramarine Blue PB29
- Winsor & Newton Professional French Ultramarine
- White Nights Ultramarine
- ShinHan PWC Permanent Rose
- Mijello Mission Gold Cerulean Blue

**Fields**:

- Brand
- Product line
- Color name
- Pigment code(s)
- Single pigment or mixture
- Tube/pan/stick
- Size options
- Manufacturer lightfastness
- Manufacturer transparency
- Manufacturer staining
- User-tested properties
- Price range by country
- Availability regions
- Swatch images
- Reviews
- Linked pigment(s)
- Linked brand
- Linked paper tests
- External official source URL
- Affiliate/non-affiliate purchase notes, if later used

**UX/UI**:

- Product card with paint image/swatch
- "Contains pigments: PB29"
- "Compare same pigment across brands"
- "Add to My Palette"
- "Review this paint"
- "Show mixes using this paint"

**Retention tactics**:

- Users use product pages before buying.
- Users keep their owned paints in My Palette.
- Reviews and real images create user contribution loops.

#### 4.2.3 Paper

A paper page should represent a specific watercolor paper or paper family.

**Fields**:

- Brand
- Product line
- Cotton percentage
- Surface: hot press, cold press, rough
- Weight: gsm/lb
- Sizing type, if known
- Sheet/pad/block/sketchbook/roll
- Country of manufacture
- Price category
- Buckling behavior
- Lifting behavior
- Glazing behavior
- Scrubbing tolerance
- Wet-on-wet behavior
- Edge control
- Granulation enhancement
- Drying speed
- Color brightness preservation
- Scan/photo examples
- Reviews
- Standard test results
- Suggested uses:
  - beginners
  - landscapes
  - botanical
  - portraits
  - plein air
  - calligraphy
  - sketching

**UX/UI**:

- Paper surface close-up
- Wash test gallery
- Edge test gallery
- Lifting test gallery
- "Add to My Paper Shelf"
- "Compare Paper"
- "Upload Test"
- "Review Paper"

**Retention tactics**:

- Artists repeatedly compare papers before purchasing.
- User-owned paper shelf makes wcWIKI personally useful.
- Standardized tests are highly visual and difficult for AI to replace.

#### 4.2.4 Brush

A brush page should represent a brush product or brush type.

**Fields**:

- Brand
- Series
- Brush type: round, mop, flat, rigger, dagger, fan, hake, liner
- Hair/fiber: sable, squirrel, goat, synthetic, mixed
- Size
- Water holding
- Spring
- Point retention
- Snap
- Wash ability
- Detail ability
- Durability
- Best uses
- Stroke tests
- Reviews
- Images/video references

**UX/UI**:

- Stroke sample gallery
- Brush tip close-up
- "Add to My Brush Rack"
- "Compare Brushes"
- "Review Brush"
- "Upload Stroke Test"

**Retention tactics**:

- Artists return for purchase decisions and brush-care learning.
- Stroke test uploads create community content.

#### 4.2.5 Brand

A brand page should represent a watercolor-related manufacturer or supplier.

**Fields**:

- Brand name
- Country
- Founded year
- Product categories
- Official website
- Product lines
- Pigments/paints count
- Papers count
- Brushes count
- Average community rating
- Review summary
- Common strengths
- Common weaknesses
- Availability by region
- Official references
- Community discussion
- Verification status:
  - Community listed
  - Official brand claimed
  - Expert reviewed

**UX/UI**:

- Brand overview card
- Product line tabs:
  - Paints
  - Papers
  - Brushes
  - Accessories
- "Review Brand"
- "Compare with another brand"
- "Follow Brand Updates"
- "Submit Product"

**Retention tactics**:

- Brand pages create commercial/search entry points.
- Users follow brands to receive updates.

#### 4.2.6 Technique

A technique page should combine text, visuals, exercises, common mistakes, and user examples.

**Examples**:

- Wet-on-wet
- Wet-on-dry
- Dry brush
- Glazing
- Lifting
- Negative painting
- Edge control
- Granulation control
- Washes
- Value study
- Color mixing
- Plein air sketching

**Fields**:

- Definition
- Skill level
- Materials needed
- Step-by-step guide
- Visual examples
- Common mistakes
- Practice exercise
- Related pigments
- Related papers
- Related brushes
- User submissions
- Expert notes
- References

**UX/UI**:

- Step-by-step visual cards
- "Try this exercise"
- "Save to My Learning Path"
- "Upload my result"
- "Ask for critique"
- "See beginner vs expert examples"

**Retention tactics**:

- Learning tasks create progress loops.
- Uploading exercise results creates community engagement.

#### 4.2.7 Subject / Motif

A subject page should represent what artists paint.

**Examples**:

- Sky
- Clouds
- Trees
- Rocks
- Water reflections
- Flowers
- Portrait skin tones
- Urban sketching
- Sea waves
- Mountains

**Fields**:

- Subject description
- Typical challenges
- Recommended pigments
- Recommended paper
- Recommended brush
- Key techniques
- Common mistakes
- Step-by-step exercises
- Artist examples
- User examples
- Related paintings
- Related articles

**UX/UI**:

- Visual inspiration board
- "Build palette for this subject"
- "Practice this subject"
- "Upload study"
- "View master examples"

**Retention tactics**:

- Users return when planning artworks.
- Connects knowledge pages to actual painting practice.

#### 4.2.8 Book / Reference / Paper

The user specifically requested review integration for papers. This should include both **watercolor paper products** and **research/academic papers or books**. To avoid confusion, name the academic/reference entity clearly.

**Entity name suggestion**: `ReferenceWork`

**Includes**:

- Books
- Journal articles
- Exhibition catalogues
- Manufacturer technical sheets
- Conservation reports
- Historical watercolor manuals
- Museum research pages
- Academic papers on pigments/materials

**Fields**:

- Title
- Author(s)
- Year
- Publisher/journal
- DOI/ISBN/URL
- Type: book, article, thesis, report, website, standard, museum source
- Abstract/summary
- Topic tags
- Related pigments/papers/artists/techniques
- Reliability rating
- Citation formats
- User review
- Expert review
- Notes for watercolor relevance

**UX/UI**:

- "Cite this source"
- "Add to Reading List"
- "Review this reference"
- "Link this reference to a wcWIKI page"
- "Show pages using this reference"

**Retention tactics**:

- Students, teachers, bloggers, and researchers return for reliable sources.
- Source mapping improves site authority.

---

## 5. Phase 2 — Visual Evidence Lab

### 5.1 Purpose

This is the most important AI-resistant feature. AI can describe watercolor behavior, but wcWIKI can show verified real-world evidence.

### 5.2 Core concept

Every material page should have a **Visual Evidence** tab containing standardized tests.

### 5.3 Standard test categories

#### 5.3.1 Pigment tests

Each pigment/product test should include:

- Mass tone swatch
- Diluted wash
- Gradient wash
- Wet-on-wet spread
- Dry brush stroke
- Lifting test
- Glazing test
- Granulation close-up
- Salt reaction, optional
- Alcohol/water bloom test, optional
- Mixing test with standard partner colors
- Scan/photo under consistent light
- Paper used
- Brush used
- Water ratio, if recorded
- Contributor
- Date tested
- Review/verification status

#### 5.3.2 Paper tests

Each paper test should include:

- Flat wash
- Gradient wash
- Wet-on-wet bloom
- Edge control
- Lifting after dry
- Scrubbing tolerance
- Glazing layers
- Masking fluid test, optional
- Tape removal test, optional
- Buckling test
- Drying speed
- Color vibrancy comparison
- Granulation enhancement comparison

#### 5.3.3 Brush tests

Each brush test should include:

- Fine point line
- Thick-to-thin stroke
- Wash area
- Water release
- Spring/snap demonstration
- Dry brush texture
- Detail marks
- Long line control
- Hair shedding note
- Tip recovery after use

#### 5.3.4 Brand tests

Brand-level evidence should aggregate:

- Average pigment quality
- Binder consistency
- Tube/pan rewetting
- Color range coverage
- Single-pigment ratio
- Pricing/value
- Packaging quality
- Availability
- Regional differences
- Known batch issues

### 5.4 Visual Evidence UI

Each entity page should include tabs:

1. Overview
2. Visual Tests
3. Reviews
4. Comparisons
5. Mixes / Uses
6. Community
7. Sources
8. History

For visual tests:

- Use masonry/grid layout for test cards
- Each test card should show:
  - Thumbnail
  - Test type
  - Material used
  - Paper used
  - Contributor badge
  - Verification badge
  - Date
  - Rating/quality score
- Add a "View Test Protocol" link
- Add "Upload Your Test" CTA
- Add filters:
  - Paper
  - Brand
  - Pigment
  - Country
  - Contributor type
  - Verified/unverified
  - Surface
  - Date

### 5.5 Test protocol pages

Create standardized protocol pages so tests become comparable.

**Example routes**:

- `/protocols/pigment-swatch-test`
- `/protocols/paper-lifting-test`
- `/protocols/brush-stroke-test`

Each protocol page should include:

- Purpose
- Required materials
- Step-by-step method
- Lighting/photo instructions
- File upload requirements
- Metadata required
- Common mistakes
- Example accepted submission
- Review criteria

### 5.6 Submission workflow

```
User opens Pigment/Paper/Brush page
→ clicks Upload Test
→ chooses test protocol
→ uploads image(s)
→ fills required metadata
→ preview card generated
→ submits
→ status: PENDING_REVIEW
→ editor/approver reviews
→ status: APPROVED / NEEDS_REVISION / REJECTED
→ contributor receives notification
→ approved test appears in Visual Evidence tab
```

### 5.7 Verification levels for tests

| Level | Badge | Meaning |
|---|---|---|
| L0 | User Submitted | Uploaded by user, not reviewed |
| L1 | Metadata Checked | Required fields completed |
| L2 | Visual Quality Checked | Image is usable and clear |
| L3 | Protocol Matched | Test follows wcWIKI protocol |
| L4 | Expert Verified | Reviewed by verified expert/editor |
| L5 | Reproduced | Similar result confirmed by multiple contributors |

### 5.8 Retention tactics

- "Your test is under review" notification loop
- Contributor profile displays accepted tests
- Monthly "Swatch Contribution Challenge"
- Test leaderboards by pigment/paper/brand
- Badges for:
  - First Swatch
  - 10 Verified Tests
  - Paper Tester
  - Pigment Explorer
  - Brush Tester
  - Protocol Master
- Personalized prompt:
  - "You own PB29. Upload a swatch on your favorite paper."
  - "Complete your palette evidence: 3 of 8 colors tested."

---

## 6. Phase 3 — Review and Rating System

### 6.1 Purpose

A review system will make wcWIKI useful for buying decisions, learning, trust-building, and user retention. AI can summarize product opinions, but real structured reviews from watercolor artists create a strong human-data moat.

### 6.2 Reviewable entity types

Reviews should support multiple entity types using a shared review architecture.

**Reviewable entities**:

- Pigment
- Paint/Product
- Paper
- Brush
- Brand
- Book/ReferenceWork
- Course/Workshop, later
- Article
- Painting page accuracy/usefulness
- Technique page
- Seller/Store, optional later
- Accessory, optional later

### 6.3 Review system architecture

Use a generic `Review` model with entity polymorphism.

**Core fields**:

- id
- entityType
- entityId
- userId
- title
- body
- ratingOverall
- ratingDimensions JSON
- images
- country
- experienceLevel
- verifiedPurchase, optional
- ownedSince, optional
- useCase
- pros
- cons
- recommendedFor
- notRecommendedFor
- status: DRAFT, PENDING, APPROVED, REJECTED, FLAGGED
- reviewerType:
  - Community
  - Verified Artist
  - Editor
  - Expert Reviewer
  - Brand Representative
- helpfulCount
- reportCount
- createdAt
- updatedAt
- reviewedBy
- reviewDecisionNote

### 6.4 Review dimensions by entity

#### 6.4.1 Paper review dimensions

- Lifting ability
- Glazing performance
- Wet-on-wet behavior
- Edge control
- Buckling resistance
- Color vibrancy
- Surface durability
- Scrubbing tolerance
- Value for money
- Beginner friendliness
- Professional suitability

**UI labels**:

- "Best for landscapes"
- "Best for botanical"
- "Good for beginners"
- "Good for wet techniques"
- "Not ideal for heavy lifting"

#### 6.4.2 Paint/Product review dimensions

- Pigment strength
- Transparency
- Granulation
- Rewetting
- Mixing behavior
- Lightfast confidence
- Texture/consistency
- Value for money
- Color accuracy vs label
- Reliability across batches

#### 6.4.3 Pigment review dimensions

A pigment review is not about a brand product only. It should capture experience with the pigment family.

- Usefulness in palette
- Mixing versatility
- Naturalness in landscape
- Portrait usefulness
- Sky/cloud usefulness
- Granulation appeal
- Staining control
- Beginner friendliness
- Substitute availability
- Personal recommendation

#### 6.4.4 Brand review dimensions

- Product consistency
- Pigment transparency in labeling
- Availability
- Price/value
- Packaging
- Lightfast reliability
- Professional trust
- Beginner friendliness
- Customer support, optional
- Regional accessibility

#### 6.4.5 Brush review dimensions

- Water holding
- Point retention
- Spring
- Control
- Wash ability
- Detail ability
- Durability
- Comfort
- Value for money
- Beginner friendliness

#### 6.4.6 ReferenceWork review dimensions

- Accuracy
- Usefulness
- Clarity
- Visual quality
- Research value
- Beginner friendliness
- Advanced value
- Citation usefulness
- Historical importance
- Practical application

#### 6.4.7 Article review dimensions

- Accuracy
- Clarity
- Visual usefulness
- Practical usefulness
- Reference quality
- Completeness
- Needs update?
- Beginner friendliness
- Advanced usefulness

### 6.5 Review UX

#### 6.5.1 Public review display

Each page should have a review summary panel:

- Overall rating
- Rating count
- Distribution chart
- Top strengths
- Top weaknesses
- Best for tags
- Reviewer mix:
  - Beginners
  - Intermediate
  - Professionals
  - Verified artists
  - Experts
- "Most helpful positive review"
- "Most helpful critical review"
- "Recent reviews"
- "Reviews with images"

#### 6.5.2 Review submission UI

A review form should be simple but structured.

**Step 1: Quick rating**

- Overall rating
- "Would you recommend this?"
- Use case selection

**Step 2: Detailed rating**

Only show dimensions relevant to entity type.

**Step 3: Evidence**

- Upload swatch/photo/test image
- Link to My Swatch Book entry
- Add paper/brush/paint used

**Step 4: Written review**

- Title
- Experience
- Pros
- Cons
- Recommended for
- Not recommended for

**Step 5: Preview and submit**

- Show review card before submission
- Explain moderation status

### 6.6 Review badges

#### 6.6.1 Reviewer badges

- First Review
- Helpful Reviewer
- Trusted Reviewer
- Paper Specialist
- Pigment Specialist
- Brush Specialist
- Brand Analyst
- Reference Reviewer
- Verified Artist Reviewer
- Expert Reviewer
- Consistent Contributor
- Evidence-Based Reviewer

#### 6.6.2 Review quality badges

- Image Included
- Swatch Included
- Protocol-Based
- Long-Term Use
- Comparative Review
- Expert Reviewed
- Verified Ownership
- Community Helpful
- Needs Update
- Flagged for Recheck

#### 6.6.3 Entity trust badges

- Community Rated
- Expert Reviewed
- Swatch Verified
- Protocol Tested
- Multi-Country Reviewed
- Beginner Approved
- Professional Choice
- Highly Cited
- Data Incomplete
- Needs More Reviews

### 6.7 Review moderation workflow

```
User submits review
→ status PENDING
→ automatic checks:
   - spam
   - banned words
   - duplicate review
   - rating/body mismatch
   - image safety/format
→ editor review queue
→ editor approves, requests revision, or rejects
→ notification to user
→ review appears publicly
→ other users vote helpful/report
→ flagged reviews return to moderation queue
```

### 6.8 Review batches

To manage quality at scale, create review batches.

**Batch types**:

- New reviews pending
- Image reviews pending
- Flagged reviews
- Brand representative responses
- Expert review requested
- Reviews needing update after 12 months
- Duplicate/conflicting reviews
- Reviews with high helpful votes to feature
- Low-quality reviews to hide/archive

**Admin UI**:

- Review Queue dashboard
- Filters:
  - Entity type
  - Rating
  - Status
  - Has image
  - Reviewer type
  - Country
  - Language
  - Age
  - Flag count
- Batch actions:
  - Approve
  - Reject
  - Request revision
  - Mark as featured
  - Mark as expert reviewed
  - Merge duplicates
  - Hide from public
  - Escalate to Super Admin

### 6.9 Anti-abuse rules

- One review per entity per user, editable later
- Review updates create version history
- Detect repeated brand-promotion language
- Mark reviews from brand representatives clearly
- Require disclosure if free product/sample received
- Allow users to report suspicious reviews
- Weight verified artist/expert/protocol-based reviews more in summaries
- Do not delete critical reviews only because they are negative; moderate for quality, not positivity

### 6.10 Retention tactics

- "Your review helped 12 artists"
- "Your review became featured"
- "This paper needs more reviews from hot-climate countries"
- "Review your saved palette colors"
- "Complete your material profile"
- "Monthly paper review campaign"
- "Top helpful reviewers of the month"
- Email/in-app notifications for review replies and helpful votes

---

## 7. Phase 4 — Personal Studio Tools

### 7.1 Purpose

Personal tools are one of the strongest retention mechanisms. Once users store their own materials and notes, wcWIKI becomes part of their painting workflow.

### 7.2 My Studio dashboard

Add a user dashboard area called **My Studio**.

**Main modules**:

- My Palette
- My Paper Shelf
- My Brush Rack
- My Swatch Book
- My Mixing Library
- My Collections
- My Learning Path
- My Reviews
- My Contributions
- My Reading List
- My Saved Comparisons
- My Practice Journal

### 7.3 My Palette

**Features**:

- Add pigment/product to personal palette
- Mark as:
  - Owned
  - Wishlist
  - Used up
  - Favorite
  - Rarely used
  - Need replacement
- Add tube/pan size
- Add purchase date
- Add price
- Add country/store, optional
- Add personal notes
- Add personal swatches
- Add mix results
- Add palette set:
  - Landscape palette
  - Portrait palette
  - Travel palette
  - Limited palette
  - Student palette

**UX/UI**:

- Grid of color cards
- Filter by color family
- Sort by brand, pigment, temperature, usage
- Visual palette strip
- "Check palette gaps"
- "Build limited palette"
- "Find substitutes"
- "Compare with recommended palettes"

**Retention tactics**:

- Users return to manage materials.
- "You have not swatched 4 colors yet" prompts action.
- Palette-based recommendations generate personalized browsing.

### 7.4 My Paper Shelf

**Features**:

- Save owned papers
- Mark favorite paper
- Add size/format
- Add personal notes
- Link swatch tests to paper
- Track paper performance by technique
- Wishlist papers

**UX/UI**:

- Shelf-style cards
- Surface filter: HP/CP/Rough
- Cotton/cellulose filter
- "Compare my papers"
- "Best paper in my shelf for wet-on-wet"

### 7.5 My Brush Rack

**Features**:

- Save brushes owned
- Add size, brand, type
- Add personal stroke tests
- Mark favorite for:
  - skies
  - foliage
  - details
  - washes
  - calligraphy
- Add condition notes

**UX/UI**:

- Brush cards with type icons
- "Build brush kit"
- "Find missing brush type"

### 7.6 My Swatch Book

**Features**:

- Upload personal swatches
- Link to pigment/product/paper/brush
- Add test type
- Add notes
- Make private/public
- Submit to Visual Evidence Lab
- Compare personal swatches with community swatches

**UX/UI**:

- Digital swatch book layout
- Color family tabs
- Before/after scans
- "Submit this as community evidence"
- "Use this in comparison"

### 7.7 My Mixing Library

**Features**:

- Save two-color mixes
- Save three-color mixes
- Link to actual products from My Palette
- Upload mix swatch image
- Add ratio notes
- Add use case:
  - shadow
  - foliage
  - sky
  - skin
  - rocks
  - water
  - neutral
- Public/private setting

**UX/UI**:

- Mixing triangle or grid
- "Create mix from my palette"
- "Find mixes for this subject"
- "Show community mixes with same colors"

### 7.8 My Collections

**Collection types**:

- Favorite artists
- Favorite paintings
- Favorite articles
- Pigments to study
- Papers to buy
- Brush wishlist
- Landscape references
- Chinese watercolor references
- Beginner learning set
- Research references

**UX/UI**:

- Save button on every entity
- Collection modal
- Public/private toggle
- Shareable collection URL

### 7.9 My Learning Path

**Features**:

- Skill level selection
- Add techniques to learning path
- Track progress
- Save exercises
- Upload practice results
- Receive feedback
- Earn badges

**Example paths**:

- Beginner Watercolor Basics
- Landscape Starter Path
- Pigment Mixing Path
- Paper Testing Path
- Brush Control Path
- Watercolor Research Path
- Plein Air Sketching Path

### 7.10 Retention tactics

- Weekly progress email/in-app summary
- "Continue where you stopped"
- Streaks for practice uploads, but avoid making it childish
- Skill badges displayed on profile
- Personal recommendations:
  - "You saved many landscape pages; try this cloud exercise."
  - "Your palette lacks a warm yellow."
  - "Your paper shelf has no rough paper."
- Private utility + optional public contribution

---

## 8. Phase 5 — Comparison and Decision Tools

### 8.1 Purpose

Comparison tools turn wcWIKI into a decision platform. AI can say "Baohong is good," but an interactive side-by-side evidence-based comparison keeps users on the site.

### 8.2 Pigment comparison

**Features**:

- Compare up to 4 pigments
- Compare:
  - color family
  - transparency
  - staining
  - granulation
  - lightfastness
  - warmth/coolness
  - common uses
  - substitutes
  - brand products
  - swatch images
  - mixes
  - community rating

**UX/UI**:

- Side-by-side comparison table
- Visual swatch row
- "Best for" row
- "Avoid when" row
- "Community notes" row
- "Add one to my palette"

### 8.3 Product/paint comparison

**Use cases**:

- Same pigment across brands
- Similar color names across brands
- Professional vs student grade
- Tube vs pan
- Regional availability

**UX/UI**:

- "Compare PB29 across brands"
- "Show only single-pigment options"
- "Show most reviewed"
- "Show beginner-friendly"

### 8.4 Paper comparison

**Features**:

- Compare paper products by:
  - cotton %
  - surface
  - weight
  - lifting
  - glazing
  - wet-on-wet
  - buckling
  - durability
  - price
  - reviews
  - test images

**UX/UI**:

- Visual test grid side-by-side
- Best-use tags
- "Choose for my technique"
- "Add to wishlist"

### 8.5 Brush comparison

**Features**:

- Compare water holding, spring, point, size, price, stroke evidence
- Filter by type and use case

### 8.6 Palette builder

**Tools**:

- Build a 6-color palette
- Build a 12-color professional palette
- Build a Sri Lankan landscape palette
- Build portrait palette
- Build travel sketch palette
- Build budget beginner palette
- Check palette balance:
  - warm/cool
  - primaries
  - earths
  - darks
  - greens
  - granulating colors
  - staining/non-staining mix

**UX/UI**:

- Drag-and-drop palette wells
- Warning labels:
  - "No warm red"
  - "No strong dark mixer"
  - "Too many similar blues"
- Suggestions based on wcWIKI data
- Save/share palette

### 8.7 Pigment substitute finder

**User flow**:

```
User opens product/pigment page
→ clicks "Find Substitute"
→ selects reason:
   - I cannot buy this
   - Too expensive
   - Not lightfast enough
   - Too staining
   - Need less granulation
   - Need vegan/non-toxic, if later supported
→ tool suggests alternatives
→ user compares swatches
→ user saves substitute
```

### 8.8 Subject palette recommender

**Examples**:

- Clouds
- Tropical landscape
- Sea waves
- Sri Lankan village scene
- Skin tones
- Flowers
- Urban sketching

**UX/UI**:

- "Build palette for this subject"
- "Use colors from My Palette only"
- "Show missing colors"
- "Show beginner option"

### 8.9 Retention tactics

- Save comparisons
- Share comparisons
- "Recently compared"
- "Most compared pigments this week"
- "Your saved palette was compared by others", if public
- Comparison pages are SEO-friendly and highly linkable

---

## 9. Phase 6 — Citation, Versioning, and Source Authority

### 9.1 Purpose

If wcWIKI wants to survive AI summarization, it must become source-grade. Serious users must need the original page for citation, version history, references, and reviewed evidence.

### 9.2 Cite This Page feature

Every public entity should have a **Cite This Page** button.

**Supported citation styles**:

- APA 7th
- MLA 9th
- Chicago Notes and Bibliography
- Chicago Author-Date
- Harvard
- IEEE
- BibTeX
- RIS export
- Plain URL citation

### 9.3 Suggested citation format

For normal encyclopedia pages:

```text
wcWIKI Contributors. "Granulation in Watercolor." wcWIKI, last reviewed 6 June 2026, https://wcwiki.org/articles/granulation-in-watercolor.
```

For pigment pages:

```text
wcWIKI Contributors. "PB29 Ultramarine Blue." wcWIKI Pigment Database, version 1.3, reviewed 6 June 2026, https://wcwiki.org/pigments/pb29-ultramarine-blue.
```

For visual tests:

```text
Liyanaarachchi, U.S. "PB29 Ultramarine Blue on 300gsm Cold Press Cotton Paper: Lifting and Granulation Test." wcWIKI Visual Evidence Lab, submitted 6 June 2026, reviewed 8 June 2026, https://wcwiki.org/tests/...
```

For reviews:

```text
Reviewer Name. "Review of Baohong Artist Cold Press 300gsm Paper." wcWIKI Reviews, 6 June 2026, https://wcwiki.org/reviews/...
```

### 9.4 Version history

Each entity should have version history.

**Versioned entities**:

- Articles
- Artists
- Paintings
- Pigments
- Products
- Papers
- Brushes
- Brands
- Techniques
- ReferenceWorks
- Visual tests
- Review summaries

**Version metadata**:

- Version number
- Changed fields
- Editor
- Reviewer
- Date/time
- Reason for change
- Diff view
- Rollback option
- Public note for major changes

### 9.5 Trust box on every page

At top or near references, show:

- Page status:
  - Draft
  - Community reviewed
  - Editor reviewed
  - Expert reviewed
  - Needs update
- Last updated
- Last reviewed
- Number of references
- Number of visual tests
- Number of reviews
- Contributors
- Reviewer
- Citation button

### 9.6 Reference quality scoring

For article and knowledge pages:

- Minimum 2 references for public trust badge
- Preferred sources:
  - Museum pages
  - Manufacturer official data
  - Books
  - Academic papers
  - Conservation studies
  - Artist interviews
  - Historical archives
- Mark source type:
  - Primary source
  - Secondary source
  - Manufacturer source
  - Community observation
  - Expert observation
  - AI-assisted draft, reviewed

### 9.7 Retention tactics

- Educators and bloggers return for citable pages.
- Contributors want their names on version history.
- "Expert reviewed" pages become highly shareable.
- Citation export creates utility beyond casual browsing.

---

## 10. Phase 7 — Community Contribution System 2.0

### 10.1 Purpose

The existing system already supports suggestions, edit proposals, translation review, artist verification, and editor applications. The next stage should turn contribution into a visible community experience.

### 10.2 Comments and discussions

Add moderated discussion areas.

**Where to add discussions**:

- Article pages
- Pigment pages
- Paper pages
- Brand pages
- Technique pages
- Visual test pages
- ReferenceWork pages
- Reviews

**Discussion types**:

- General comment
- Question
- Correction suggestion
- Test result discussion
- Alternative experience
- Reference suggestion

**UX/UI**:

- Tabs:
  - Reviews
  - Questions
  - Discussion
  - Corrections
- Allow sorting:
  - Most helpful
  - Newest
  - Expert replies
- Allow "Mark as answered" for questions

### 10.3 Contributor profiles

Enhance profiles beyond basic public profile.

**Add profile sections**:

- Contribution count
- Accepted edits
- Accepted swatches
- Reviews written
- Helpful votes received
- Specialist areas
- Owned materials, optional public
- Public swatch book, optional
- Artist verification badge
- Expert reviewer badge
- Editor/Approver badge

### 10.4 Reputation system

**Points should reward quality, not just quantity.**

Suggested points:

- Approved edit: +5
- Approved article: +20
- Approved translation: +10
- Approved swatch/test: +15
- Review approved: +10
- Review marked helpful: +2
- Expert verification of submission: +20
- Flag accepted: +3
- Bad submission rejected repeatedly: possible reputation penalty, carefully applied

### 10.5 Badges

#### Contribution badges

- First Edit
- First Article
- First Translation
- First Swatch
- First Review
- 10 Helpful Votes
- 50 Helpful Votes
- 100 Helpful Votes
- Visual Evidence Contributor
- Pigment Data Contributor
- Paper Data Contributor
- Brand Data Contributor
- Translation Contributor
- Reference Contributor

#### Expertise badges

- Verified Watercolor Artist
- Pigment Specialist
- Paper Specialist
- Brush Specialist
- Historical Researcher
- Conservation Reference Contributor
- Landscape Specialist
- Botanical Specialist
- Urban Sketching Specialist
- Teaching Contributor

#### Trust badges

- Editor
- Approver
- Expert Reviewer
- Official Brand Representative
- Museum/Institution Contributor, later
- Educator Contributor

### 10.6 Monthly contribution campaigns

Examples:

- PB29 Month: upload Ultramarine swatches
- Paper Lifting Month
- Beginner Paper Review Campaign
- Tropical Landscape Palette Campaign
- Granulation Evidence Challenge
- Translate 20 Core Pages Campaign
- Historical Watercolor Artist Month
- Sri Lankan Watercolor Documentation Month

**UX/UI**:

- Home page campaign banner
- Progress bar
- Leaderboard
- Featured contributors
- Submission CTA
- Campaign archive

### 10.7 Retention tactics

- Notifications when contributions are approved
- Profile badges
- Public contribution history
- Featured contributor of the month
- Community challenges
- Watch/follow pages:
  - "Notify me when new swatches are added"
  - "Notify me when this article is updated"
  - "Notify me when this paper receives new reviews"

---

## 11. Phase 8 — wcWIKI AI Assistant

### 11.1 Purpose

Instead of allowing external AI to replace wcWIKI, put AI inside wcWIKI as a guided interface to verified wcWIKI data.

### 11.2 Important rule

The assistant should not become a generic chatbot. It should be a **wcWIKI-grounded assistant**.

It should answer using:

- Approved articles
- Pigment database
- Paper database
- Product data
- Visual test metadata
- Reviews
- Citation data
- User's own My Studio data, only when logged in and permitted

### 11.3 Assistant modes

#### 11.3.1 Public Ask wcWIKI

For visitors.

Examples:

- "What is granulation?"
- "Show me pigments similar to Ultramarine Blue"
- "Which paper is good for lifting?"
- "What is the difference between cold press and rough?"
- "Show me Sargent watercolor examples"

Answer format:

- Short answer
- Source cards
- Visual evidence cards
- Related pages
- "Open comparison tool"
- "Save this to learning path", for logged-in users

#### 11.3.2 My Studio Assistant

For logged-in users.

Examples:

- "Can I paint a tropical landscape with my current palette?"
- "Which of my papers is best for wet-on-wet?"
- "Suggest a 6-color travel palette from my paints"
- "What should I practice next?"
- "Find a substitute from colors I own"

#### 11.3.3 Editor Assistant

For editors.

Examples:

- Draft article outline from existing references
- Suggest missing fields in pigment page
- Identify missing citations
- Suggest related entities
- Summarize review trends
- Detect duplicate entities

#### 11.3.4 Approver Assistant

For approvers.

Examples:

- Summarize pending edits
- Highlight suspicious reviews
- Compare old/new content
- Check reference completeness
- Detect possible spam or low-quality submissions

### 11.4 UX/UI

- Floating "Ask wcWIKI" button
- Context-aware:
  - On pigment page: "Ask about this pigment"
  - On paper page: "Ask about this paper"
  - On My Palette: "Ask about my palette"
- Answer cards should link to:
  - Pages
  - Swatches
  - Reviews
  - Comparisons
  - Citation section
- Avoid long wall-of-text answers
- Always show source links
- Always include "View evidence" when available

### 11.5 Data safety

- Do not expose private My Studio data to public answers
- Allow users to opt out of using their private data for AI personalization
- Log AI queries for improvement, with privacy controls
- Mark AI-generated content clearly
- Require human review for AI-suggested article content

### 11.6 Retention tactics

- AI becomes the gateway to deeper pages
- Personalized answers encourage account creation
- Visual evidence cards bring users into unique wcWIKI content
- Users can save AI answers into notes or collections

---

## 12. Phase 9 — Learning Paths and Practice System

### 12.1 Purpose

Watercolor users do not only search facts. They want to improve skills. Learning paths create long-term retention.

### 12.2 Learning path structure

Each path should include:

- Overview
- Skill level
- Estimated time
- Materials needed
- Lessons
- Related articles
- Practice exercises
- Upload area
- Feedback/discussion
- Completion badge

### 12.3 Suggested learning paths

#### Beginner

- What is watercolor?
- Basic materials
- Water control
- Flat wash
- Gradient wash
- Wet-on-wet
- Wet-on-dry
- Simple color mixing
- First landscape

#### Intermediate

- Edges and timing
- Glazing
- Lifting
- Negative painting
- Granulation
- Limited palettes
- Atmospheric perspective
- Trees and foliage
- Skies and clouds

#### Advanced

- Pigment behavior control
- Large washes
- Plein air decision making
- Complex composition
- Master study
- Material testing
- Personal palette design

#### Research/Knowledge Path

- How to read pigment codes
- How to cite watercolor sources
- How to test papers
- How to document swatches
- How to contribute to wcWIKI

### 12.4 Exercise submission

Users should upload practice exercises.

**Workflow**:

```
User opens lesson
→ completes exercise
→ uploads image
→ selects visibility: private/public
→ adds notes
→ optionally requests feedback
→ receives comments or expert review
→ progress updated
```

### 12.5 Retention tactics

- Progress bar
- Completion badges
- Reminders
- Community feedback
- "Next recommended lesson"
- Public portfolio of completed exercises, optional
- Challenge participation

---

## 13. Phase 10 — Advanced Discovery and Visual Search

### 13.1 Purpose

Discovery should go beyond text search. Watercolor is visual, material-based, and context-based.

### 13.2 Advanced faceted search

Add filters for:

- Entity type
- Pigment code
- Brand
- Paper surface
- Color family
- Technique
- Subject
- Artist style
- Country
- Time period
- Review rating
- Evidence level
- Expert reviewed
- Has swatch
- Has citation
- Language
- Beginner/professional suitability

### 13.3 Related content engine

Each page should suggest:

- Related pigments
- Related products
- Related papers
- Related techniques
- Related subjects
- Related artist examples
- Related articles
- Related reviews
- Related visual tests

### 13.4 Visual similarity search

Later-stage feature.

**Use cases**:

- Find paintings with similar colors
- Find swatches with similar hue
- Find similar granulation texture
- Find paper texture examples
- Find similar sky/cloud paintings
- Find similar palette combinations

### 13.5 Color extraction

For painting pages and swatches:

- Extract dominant colors
- Display palette strip
- Link colors to nearest pigments
- Show possible palette reconstruction
- Allow "Save palette idea"

### 13.6 Retention tactics

- Visual exploration encourages longer sessions
- "Similar to this" browsing creates rabbit holes
- Color extraction connects paintings to materials and palette builder

---

## 14. Phase 11 — Partnerships, API, and External Embeds

### 14.1 Purpose

wcWIKI should become infrastructure for watercolor knowledge, not only a website.

### 14.2 Public API expansion

Current API supports artists, paintings, articles, translations, and uploads. Expand to:

- Pigments
- Products
- Papers
- Brushes
- Brands
- Techniques
- Subjects
- Reviews
- Visual tests
- Citations
- Comparisons, read-only endpoints
- Public statistics

### 14.3 Embed widgets

Allow external websites to embed:

- Pigment card
- Paper review summary
- Brand rating summary
- Swatch comparison
- Citation card
- Artist profile card
- Painting card
- Technique card

### 14.4 Institution/educator accounts

Possible future account type:

- Educator
- Institution
- Art school
- Museum
- Brand representative

Features:

- Create reading lists
- Create class collections
- Submit official references
- Request expert review
- Embed wcWIKI pages in LMS

### 14.5 Brand claim system

Similar to artist claim, allow official brand representatives to claim brand pages.

**Important**:

- Brand representatives should not control reviews.
- Brand updates should be moderated.
- Brand-representative content must be clearly labeled.

### 14.6 Retention tactics

- External backlinks
- Educator use
- Institutional trust
- Brand participation without losing neutrality
- API-based ecosystem

---

## 15. Phase 12 — Sustainability and Monetization

### 15.1 Principle

Do not damage trust. wcWIKI should remain neutral and source-grade.

### 15.2 Possible monetization models

#### 15.2.1 Free core + premium studio tools

Free:

- Read encyclopedia
- Basic search
- Submit suggestions
- Basic reviews
- Basic My Palette

Premium, later:

- Advanced My Studio analytics
- Unlimited private swatches
- Advanced comparison exports
- Palette reports
- PDF export
- Course certificates
- Advanced AI assistant usage

#### 15.2.2 Institutional accounts

For:

- Art schools
- Universities
- Online course providers
- Workshops

Features:

- Class reading lists
- Student progress
- Private collections
- Assignment submissions
- Citation exports

#### 15.2.3 Ethical affiliate links

If added:

- Clearly disclose affiliate links
- Keep reviews independent
- Do not rank by commission
- Allow non-affiliate official links
- Separate editorial rating from commercial links

#### 15.2.4 Sponsorship

Possible:

- Monthly challenge sponsor
- Translation sponsor
- Research/swatch campaign sponsor
- But all sponsored content must be labeled

### 15.3 Retention tactics

- Users support the platform because their studio data lives there
- Contributors support because their public profile and reputation grows
- Educators support because it saves teaching time

---

## 16. New Page Templates

### 16.1 Pigment page template

```text
Title: PB29 Ultramarine Blue

1. Hero card
   - Swatch
   - Pigment code
   - Color family
   - Main properties
   - Trust badges

2. Quick summary
3. Pigment identity
4. Visual evidence
5. Behavior
   - Granulation
   - Staining
   - Transparency
   - Lifting
   - Mixing
6. Brand products using this pigment
7. Common uses
8. Mixing examples
9. Substitutes
10. Reviews
11. Artist examples
12. Related techniques and subjects
13. Sources and references
14. Version history
15. Actions
   - Add to My Palette
   - Compare
   - Upload Swatch
   - Review
   - Cite
```

### 16.2 Paper page template

```text
Title: Baohong Artist Cold Press 300gsm

1. Hero card
   - Paper close-up
   - Type
   - Surface
   - Weight
   - Cotton %
   - Rating summary

2. Quick summary
3. Product details
4. Visual tests
5. Performance scores
6. Reviews
7. Best uses
8. Not ideal for
9. Comparison with similar papers
10. User swatches on this paper
11. Related articles
12. Sources
13. Version history
14. Actions
   - Add to My Paper Shelf
   - Compare
   - Upload Test
   - Review
   - Cite
```

### 16.3 Brand page template

```text
Title: Daniel Smith

1. Brand overview
2. Product categories
3. Product lines
4. Community rating
5. Strengths and weaknesses
6. Popular products
7. Visual evidence summary
8. Reviews
9. Official information
10. Brand representative notes, if claimed
11. Related articles
12. Sources
13. Version history
14. Actions
   - Follow brand
   - Review brand
   - Submit product
   - Compare brand
   - Cite
```

### 16.4 Technique page template

```text
Title: Wet-on-Wet Technique

1. Quick explanation
2. When to use
3. Materials needed
4. Step-by-step visual guide
5. Timing guide
6. Common mistakes
7. Recommended papers
8. Recommended brushes
9. Recommended pigments
10. Exercises
11. User examples
12. Expert notes
13. Related subjects
14. Sources
15. Actions
   - Save to Learning Path
   - Upload Exercise
   - Ask Question
   - Cite
```

### 16.5 Review page template

```text
Title: Review of [Entity]

1. Review title
2. Reviewer badge
3. Rating summary
4. Use case
5. Detailed scores
6. Written review
7. Pros
8. Cons
9. Evidence images
10. Materials used
11. Helpful/report actions
12. Review version history
13. Moderator note, if any
```

---

## 17. Database Model Suggestions

### 17.1 New enums

```prisma
enum EntityType {
  ARTIST
  PAINTING
  ARTICLE
  PIGMENT
  PRODUCT
  PAPER
  BRUSH
  BRAND
  TECHNIQUE
  SUBJECT
  REFERENCE_WORK
  VISUAL_TEST
  REVIEW
}

enum ReviewStatus {
  DRAFT
  PENDING
  APPROVED
  REJECTED
  FLAGGED
  NEEDS_REVISION
}

enum EvidenceStatus {
  DRAFT
  PENDING_REVIEW
  APPROVED
  REJECTED
  NEEDS_REVISION
}

enum EvidenceLevel {
  USER_SUBMITTED
  METADATA_CHECKED
  VISUAL_QUALITY_CHECKED
  PROTOCOL_MATCHED
  EXPERT_VERIFIED
  REPRODUCED
}
```

### 17.2 Suggested models

Add models gradually, not all at once.

**Phase 1 minimum**:

- Pigment
- Brand
- Product
- Paper
- Brush
- Technique
- Subject

**Phase 2**:

- VisualTest
- TestProtocol
- SwatchImage
- MixRecord

**Phase 3**:

- Review
- ReviewVote
- ReviewFlag
- ReviewModerationAction

**Phase 4**:

- UserPaletteItem
- UserPaperItem
- UserBrushItem
- UserSwatch
- UserMix
- UserCollection
- CollectionItem
- LearningPath
- UserLearningProgress

**Phase 6**:

- Version
- Citation
- SourceQualityScore

### 17.3 Generic polymorphic design

Use existing patterns from Translation, Suggestion, and EditHistory where entityType + entityId is used.

For new cross-entity features:

- Reviews
- Collections
- Comments
- Visual tests
- Citations
- Version history
- Reports

Use:

```text
entityType
entityId
```

This allows the same system to support articles, pigments, papers, brands, and future entities.

---

## 18. UX/UI System Additions

### 18.1 Global navigation changes

Current navigation should remain simple. Add a "Explore" mega menu later.

Suggested top-level navigation:

- Search
- Artists
- Paintings
- Articles
- Materials
- Techniques
- Visual Lab
- Reviews
- My Studio

Where "Materials" includes:

- Pigments
- Paints
- Papers
- Brushes
- Brands

### 18.2 Page action bar

Every detail page should have a consistent action bar:

- Save
- Compare
- Review
- Contribute
- Cite
- Share

On mobile, use sticky bottom action bar:

- Save
- Compare
- Review
- More

### 18.3 Trust and evidence design

Use consistent badges:

- Expert Reviewed
- Community Tested
- Swatch Verified
- Needs More Data
- Recently Updated
- Highly Reviewed
- Citable
- Official Source Added
- Brand Claimed
- User Submitted

### 18.4 Onboarding

After registration, show:

```
Welcome to wcWIKI.
What do you want to do?

[Learn watercolor]
[Research materials]
[Save my palette]
[Contribute knowledge]
[Find artists/paintings]
```

Based on selection, personalize dashboard.

### 18.5 Empty-state design

For new databases, empty states are important.

Examples:

- "No swatches yet. Be the first to upload PB29 on this paper."
- "This paper has no lifting tests yet."
- "No reviews from Sri Lanka yet. Add your experience."
- "This pigment page needs references."

Empty states should encourage contribution.

### 18.6 Mobile-first rules

- Swatch grids should be swipeable
- Comparison tables should stack vertically on mobile
- Sticky action bar
- Large touch targets
- Minimal text in cards
- Progressive disclosure:
  - summary first
  - detailed tables collapsed
  - references collapsed
  - advanced filters hidden behind filter button

---

## 19. SEO and AI-Survival Content Strategy

### 19.1 Do not publish only generic articles

Avoid pages that only contain basic explanations.

Weak:

- "What is watercolor paper?"
- "What is granulation?"

Strong:

- "Granulation behavior of PB29 on cotton and cellulose watercolor papers"
- "Cold press vs rough paper lifting test with visual examples"
- "Best pigments for tropical landscape watercolor: tested swatches and mixes"
- "PB29 Ultramarine Blue: pigment behavior, brand comparison, mixes, and substitutes"

### 19.2 Source-grade content formula

Every important page should include:

- Original explanation
- Structured data
- Visual evidence
- Reviews
- References
- Version history
- Citation button
- Contributor/reviewer information
- Interactive tool link

### 19.3 Programmatic SEO pages

Create valuable, non-thin pages from structured data.

Examples:

- `/compare/pigments/pb29-vs-pb35`
- `/papers/best-for/lifting`
- `/papers/best-for/wet-on-wet`
- `/pigments/granulating-blue-pigments`
- `/brands/[brand]/single-pigment-colors`
- `/subjects/clouds/recommended-pigments`
- `/techniques/lifting/best-papers`
- `/reviews/papers/cold-press-300gsm`

Each page must include real data and visual evidence, not only generated text.

### 19.4 AI crawler strategy

Publicly expose enough content for authority:

- Basic article summaries
- Main structured data
- Selected image thumbnails
- Citation metadata
- JSON-LD

Keep deeper interactive value inside the site:

- Full comparison tools
- High-resolution swatch grids
- Personal tools
- Advanced AI assistant
- Review analytics
- Export tools
- User notebooks

### 19.5 Schema markup additions

Add JSON-LD for:

- Product
- Review
- AggregateRating
- HowTo
- FAQPage
- Dataset
- ScholarlyArticle for ReferenceWork where applicable
- CreativeWork
- Course, later
- CollectionPage

---

## 20. Notifications and Retention System

### 20.1 In-app notifications

Extend current notification bell.

Notify users when:

- Their review is approved
- Their swatch/test is approved
- Their edit is accepted/rejected
- Someone marks review helpful
- Someone comments on their test
- A saved page is updated
- A followed brand adds new product
- A followed pigment gets new swatches
- A challenge they joined has new results
- A learning path task is due
- Their contribution badge is awarded

### 20.2 Email notifications

Add email later, with preferences.

User can choose:

- Important only
- Weekly digest
- Contribution updates
- Learning reminders
- Followed pages updates
- Review interactions
- No email

### 20.3 Weekly digest

Digest sections:

- New content in saved topics
- New reviews for saved products
- New swatches for saved pigments
- Your contribution status
- Suggested next learning task
- Trending watercolor searches
- Monthly challenge

### 20.4 Retention metrics to track

- New registrations
- Activated users
- Users who save first item
- Users who add first palette item
- Users who upload first swatch
- Users who write first review
- Weekly returning users
- Review submission rate
- Swatch approval rate
- Search-to-save conversion
- Page-to-review conversion
- Page-to-compare conversion
- AI answer-to-page click-through
- Learning path continuation rate

---

## 21. Admin Dashboards Required

### 21.1 Content quality dashboard

Show:

- Pages without references
- Pages without images
- Pigments without swatches
- Papers without reviews
- Brands without official sources
- Articles needing update
- Pages with low quality score
- Pages with many correction suggestions

### 21.2 Review moderation dashboard

As detailed in Phase 3.

### 21.3 Visual evidence dashboard

Show:

- Pending visual tests
- Tests needing metadata
- Poor image quality submissions
- Protocol mismatch
- Expert verification requests
- Reproduced tests
- Conflicting evidence

### 21.4 Community dashboard

Show:

- Active contributors
- New users
- Contributor retention
- Badges awarded
- Flagged users
- Suspicious review patterns

### 21.5 AI assistant analytics

Show:

- Common AI questions
- Pages suggested by AI
- Click-through to evidence
- Questions with no answer
- Missing content opportunities
- Hallucination/failure reports

### 21.6 SEO/source authority dashboard

Show:

- Indexed pages
- Pages with citation metadata
- Pages with JSON-LD errors
- Most cited pages, if tracked
- Search queries leading to no result
- Content gaps

---

## 22. Suggested Phase-by-Phase Build Plan

### Phase 0 — 1 to 2 development cycles

**Build first**:

- Safe migrations
- Automated backups
- Continuous Meilisearch sync
- Basic smoke tests
- Admin system health panel

**Do not start major user-generated features until backups and safe migrations are done.**

### Phase 1 — 2 to 4 development cycles

**Build**:

- New entity models:
  - Pigment
  - Brand
  - Product
  - Paper
  - Brush
  - Technique
- Basic CRUD for admins/editors
- Public pages
- Search indexing
- Basic filters
- Add references editor to all new entities
- Add "Cite This Page" placeholder

**UX target**:

- Users can browse material pages.
- Editors can add structured watercolor data.

### Phase 2 — 2 to 4 development cycles

**Build**:

- VisualTest model
- TestProtocol model
- Swatch upload workflow
- Visual Evidence tab
- Evidence badges
- Visual test moderation queue
- Public visual test cards

**UX target**:

- Users can see and upload real watercolor evidence.

### Phase 3 — 2 to 4 development cycles

**Build**:

- Review model
- Review form
- Review summary panel
- Review moderation queue
- Helpful/report actions
- Review badges
- Review batches

**UX target**:

- Users can review papers, pigments, brands, brushes, and references.

### Phase 4 — 3 to 5 development cycles

**Build**:

- My Studio dashboard
- My Palette
- My Paper Shelf
- My Brush Rack
- My Swatch Book
- Collections
- Saved comparisons

**UX target**:

- Users have a reason to log in repeatedly.

### Phase 5 — 2 to 4 development cycles

**Build**:

- Pigment comparison
- Paper comparison
- Product comparison
- Palette builder
- Substitute finder
- Subject palette recommender

**UX target**:

- wcWIKI becomes a practical decision tool.

### Phase 6 — 2 to 3 development cycles

**Build**:

- Full version history
- Diff and rollback
- Citation export styles
- Trust box
- Source quality scoring
- Public reviewed status

**UX target**:

- wcWIKI becomes citable and academically trustworthy.

### Phase 7 — 2 to 4 development cycles

**Build**:

- Comments/discussions
- Contributor profile expansion
- Reputation points
- Badges
- Monthly campaigns
- Follow/watch pages

**UX target**:

- wcWIKI becomes community-driven.

### Phase 8 — 3 to 6 development cycles

**Build**:

- wcWIKI-grounded AI assistant
- Source-card answers
- My Studio assistant
- Editor/Approver assistant
- AI query analytics
- Privacy settings

**UX target**:

- AI becomes part of wcWIKI instead of replacing wcWIKI.

### Phase 9 onwards

**Build**:

- Learning paths
- Practice submissions
- Visual search
- API expansion
- Embeds
- Partnerships
- Monetization experiments

---

## 23. Minimum Viable AI-Resistant Product

If resources are limited, build this minimum set first:

1. Pigment pages
2. Paper pages
3. Brand pages
4. Visual swatch/test upload
5. Review system for papers, pigments, brands
6. My Palette
7. My Paper Shelf
8. Compare pigments
9. Compare papers
10. Cite This Page
11. Contributor badges
12. Continuous search sync
13. Automated backups

This would already move wcWIKI beyond a normal article site.

---

## 24. Success Metrics

### 24.1 Product metrics

- Number of pigment pages
- Number of paper pages
- Number of brand pages
- Number of visual tests
- Number of reviews
- Number of user palettes
- Number of saved items
- Number of comparisons created
- Number of citations copied
- Number of learning path enrollments

### 24.2 Retention metrics

- Registration to first save conversion
- Registration to first palette item conversion
- Registration to first review conversion
- Registration to first swatch upload conversion
- 7-day return rate
- 30-day return rate
- Weekly active contributors
- Monthly active reviewers
- Average pages per session
- Search-to-interaction rate

### 24.3 Trust metrics

- Pages with references
- Pages expert reviewed
- Visual tests verified
- Reviews with images
- Reviews marked helpful
- Pages with version history
- Correction resolution time
- Flag resolution time

### 24.4 AI-defense metrics

- AI assistant answer-to-page click rate
- AI assistant answer-to-tool use rate
- Percentage of pages with non-summarizable interactive value
- Percentage of top SEO pages with visual evidence
- Percentage of material pages with reviews
- Percentage of material pages with user-save actions

---

## 25. Development Prompts for Future Coding Agents

### 25.1 General instruction prompt

```text
You are working on wcWIKI.org, a production Next.js 15 + TypeScript + Prisma + PostgreSQL + Meilisearch watercolor knowledge platform. The existing system already supports artists, paintings, articles, translations, roles, media, edit proposals, suggestions, notifications, API keys, and admin tools. Build new features additively without breaking existing flows. Follow the future-proof strategy: every new material/knowledge page must support structured data, visual evidence, reviews, save/compare/contribute actions, citations, and search indexing. Do not create generic article-only features when a structured entity or interactive tool is more appropriate.
```

### 25.2 Review system coding prompt

```text
Build a generic review system for wcWIKI. It must support polymorphic reviews using entityType + entityId for Pigment, Product, Paper, Brush, Brand, ReferenceWork, Article, Technique, and future entities. Include overall rating, entity-specific ratingDimensions JSON, review body, pros, cons, recommendedFor, notRecommendedFor, images, reviewer type, helpful votes, report/flag actions, moderation status, and review history. Add public review summary panels, review submission UI, user dashboard section "My Reviews", and admin review moderation queue with batch actions. Reviews must be additive and must not break existing artist/painting/article pages.
```

### 25.3 Visual evidence lab coding prompt

```text
Build the wcWIKI Visual Evidence Lab. Add TestProtocol and VisualTest models. VisualTest must support entityType + entityId, images, test type, protocol used, metadata JSON, contributor, evidence status, evidence level, reviewer, and review notes. Add public Visual Evidence tabs to Pigment, Product, Paper, Brush, and Brand pages. Add upload workflow with required metadata, moderation queue, evidence badges, and filters by paper, pigment, brand, test type, country, contributor, and verification level. Ensure images use the existing R2 + Sharp media pipeline.
```

### 25.4 My Studio coding prompt

```text
Build the My Studio dashboard for logged-in users. Include My Palette, My Paper Shelf, My Brush Rack, My Swatch Book, My Mixing Library, My Collections, My Reviews, My Contributions, and My Learning Path. Use existing auth and profile system. Each saved item should connect to public entities and support private notes, wishlist/owned/favorite status, personal images where relevant, and public/private visibility. Add "Add to My Palette", "Add to My Paper Shelf", "Save", and "Add to Collection" CTAs on relevant public pages.
```

---

## 26. Final Priority Recommendation

The best next move is not to build everything at once.

Recommended order:

1. Stabilize production data safety.
2. Add material taxonomy: pigments, papers, brands, products.
3. Add visual evidence lab.
4. Add review system.
5. Add My Studio personal tools.
6. Add comparison tools.
7. Add citation/versioning authority.
8. Add community campaigns.
9. Add wcWIKI AI assistant.

This sequence gives wcWIKI a strong foundation, original data, user retention, and AI-resistant value.

The most important strategic sentence remains:

> **wcWIKI should not be only a place where users read watercolor information. It should be the place where watercolor knowledge is tested, reviewed, compared, saved, cited, and improved by the global watercolor community.**
