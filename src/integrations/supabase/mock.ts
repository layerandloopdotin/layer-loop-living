import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "./types";

type Row = Record<string, unknown>;

const CAT_IDS = {
  lighting: "11111111-1111-4111-8111-111111111101",
  vases: "22222222-2222-4222-8222-222222222202",
  collectibles: "8da18b92-6ce5-4b2a-abe9-f46eb7fb02e9",
  desk: "44444444-4444-4444-8444-444444444404",
  quirkyDesk: "c0000000-0000-4000-8000-000000000001",
  statement: "c0000000-0000-4000-8000-000000000002",
} as const;

const SPACE_IDS = {
  lounge: "aaaa1111-1111-4111-8111-111111111101",
  suite: "aaaa2222-2222-4222-8222-222222222202",
  cafe: "aaaa3333-3333-4333-8333-333333333303",
  dining: "aaaa4444-4444-4444-8444-444444444404",
  study: "aaaa5555-5555-4555-8555-555555555505",
} as const;

const DEFAULT_COLORS = [
  { name: "Bone White", hex: "#EDE6DA", images: [] },
  { name: "Sandstone", hex: "#CDB79A", images: [] },
  { name: "Terracotta", hex: "#B8643F", images: [] },
  { name: "Sage", hex: "#8E9A7E", images: [] },
  { name: "Charcoal", hex: "#2E2B28", images: [] },
];

const DEFAULT_CARE = [
  {
    label: "Cleaning",
    value:
      "Dust with a soft dry cloth. For marks, use a lightly damp cloth — no solvents or abrasive sprays.",
  },
  {
    label: "Heat & sun",
    value:
      "Keep away from direct afternoon sun, heaters and hot cars; prolonged heat above 50°C can soften the print.",
  },
  {
    label: "Wear & tear",
    value:
      "Fine layer lines are part of the making, not a flaw. Small scuffs can be eased with a very fine sanding pad.",
  },
  {
    label: "End of life",
    value:
      "Send it back to our store — we grind and recycle returned pieces instead of sending them to landfill.",
  },
];

function specsFor(cat: string) {
  if (cat === "Lighting") {
    return [
      { label: "Dimensions", value: "Ø 22 × H 30 cm" },
      { label: "Weight", value: "650 g" },
      { label: "Material", value: "PLA+ shade, PETG base" },
      { label: "Bulb", value: "E27 warm LED, 2700K (included)" },
      { label: "Cable", value: "1.8 m fabric cord with inline switch" },
    ];
  }
  if (cat === "Vases & Planters") {
    return [
      { label: "Dimensions", value: "Ø 12 × H 24 cm" },
      { label: "Weight", value: "280 g" },
      { label: "Material", value: "PETG, watertight" },
      { label: "Use", value: "Fresh or dried stems" },
    ];
  }
  if (cat === "Collectibles") {
    return [
      { label: "Dimensions", value: "14 × 8 × 18 cm" },
      { label: "Weight", value: "220 g" },
      { label: "Material", value: "Matte PLA" },
      { label: "Finish", value: "Hand-sanded" },
    ];
  }
  return [
    { label: "Dimensions", value: "10 × 10 × 12 cm" },
    { label: "Weight", value: "180 g" },
    { label: "Material", value: "PLA with TPU non-slip feet" },
    { label: "Modules", value: "3 stackable trays" },
  ];
}

function makeProduct(
  sort: number,
  slug: string,
  name: string,
  tagline: string,
  short: string,
  price: number,
  catId: string,
  catName: string,
  spaceIds: string[],
  images: string[],
  featured: boolean,
  world: "space" | "culture" = "space",
  extra?: {
    long?: string;
    is_drop?: boolean;
    colors?: { name: string; hex: string; images: string[] }[];
  },
): Row {
  const now = new Date("2026-10-01T00:00:00Z").toISOString();
  return {
    id: `prod-${slug}`,
    slug,
    name,
    tagline,
    short_description: short,
    long_description:
      extra?.long ??
      `${name} is printed layer by layer in our studio, then finished by hand. Each piece takes several hours on the printer, so tiny variations in texture make every one slightly different. We use non-toxic, plant-based and recyclable filaments, and design every object to be light, sturdy and easy to live with.`,
    price,
    compare_at_price: null,
    featured,
    published: true,
    sort,
    category_ids: [catId],
    space_ids: spaceIds,
    images,
    colors: extra?.colors ?? DEFAULT_COLORS,
    specs: specsFor(catName),
    care: DEFAULT_CARE,
    variants: [],
    engravable: true,
    engraving_price: 199,
    engraving_max_chars: 20,
    engraving_placements: ["Front", "Base", "Back"],
    engraving_images: [],
    lit_images: [],
    world,
    is_drop: extra?.is_drop ?? false,
    created_at: now,
    updated_at: now,
  };
}

function createInitialTables(): Record<string, Row[]> {
  const now = new Date("2026-10-01T00:00:00Z").toISOString();
  return {
    site_content: [],
    categories: [
      {
        id: CAT_IDS.lighting,
        name: "Lighting",
        image: "asset:tile-lighting.jpg",
        sort: 1,
        world: "space",
        created_at: now,
      },
      {
        id: CAT_IDS.vases,
        name: "Vases & Planters",
        image: "asset:tile-vases.jpg",
        sort: 2,
        world: "space",
        created_at: now,
      },
      {
        id: CAT_IDS.collectibles,
        name: "Collectibles",
        image: "asset:tile-collectibles.jpg",
        sort: 3,
        world: "culture",
        created_at: now,
      },
      {
        id: CAT_IDS.desk,
        name: "Desk Essentials",
        image: "asset:tile-desk.jpg",
        sort: 4,
        world: "space",
        created_at: now,
      },
      {
        id: CAT_IDS.quirkyDesk,
        name: "Quirky Desk",
        image: "asset:c-puffer.jpg",
        sort: 6,
        world: "culture",
        created_at: now,
      },
      {
        id: CAT_IDS.statement,
        name: "Statement Pieces",
        image: "asset:c-tirestack.jpg",
        sort: 7,
        world: "culture",
        created_at: now,
      },
    ],
    spaces: [
      { id: SPACE_IDS.lounge, name: "The Lounge", sort: 1, created_at: now },
      { id: SPACE_IDS.suite, name: "The Suite", sort: 2, created_at: now },
      { id: SPACE_IDS.cafe, name: "The Café", sort: 3, created_at: now },
      { id: SPACE_IDS.dining, name: "The Dining Room", sort: 4, created_at: now },
      { id: SPACE_IDS.study, name: "The Study", sort: 5, created_at: now },
    ],
    products: [
      makeProduct(
        1,
        "the-stack-lamp",
        "The Stack Lamp",
        "Layered sculptural table lamp",
        "Stacked, softly glowing layers that turn a side table into a quiet centrepiece.",
        340,
        CAT_IDS.lighting,
        "Lighting",
        [SPACE_IDS.lounge, SPACE_IDS.study],
        ["asset:hero-lamp.jpg", "asset:stack-2.jpg", "asset:stack-3.jpg", "asset:stack-4.jpg"],
        false,
      ),
      makeProduct(
        2,
        "terra",
        "Terra",
        "Warm ceramic lighting",
        "A softly ribbed ceramic-look shade that pools warm, low light — made for slow evenings.",
        280,
        CAT_IDS.lighting,
        "Lighting",
        [SPACE_IDS.lounge, SPACE_IDS.suite],
        ["asset:terra.jpg", "asset:terra-2.jpg", "asset:terra-3.jpg", "asset:terra-4.jpg"],
        true,
      ),
      makeProduct(
        3,
        "noir",
        "Noir",
        "Glazed ceramic sphere",
        "A deep, glaze-finished sphere that glows from within like a lantern at dusk.",
        310,
        CAT_IDS.lighting,
        "Lighting",
        [SPACE_IDS.lounge, SPACE_IDS.cafe],
        ["asset:noir.jpg"],
        true,
      ),
      makeProduct(
        4,
        "haze",
        "Haze",
        "Arched floor light",
        "A gentle arched floor light that leans over a sofa or reading chair.",
        265,
        CAT_IDS.lighting,
        "Lighting",
        [SPACE_IDS.lounge],
        ["asset:haze.jpg"],
        true,
      ),
      makeProduct(
        5,
        "orb",
        "Orb",
        "Glass on raw stone",
        "A frosted globe resting on a stone-textured base — small, calm and sculptural.",
        240,
        CAT_IDS.lighting,
        "Lighting",
        [SPACE_IDS.suite, SPACE_IDS.cafe],
        ["asset:p-orb.jpg"],
        false,
      ),
      makeProduct(
        6,
        "dune",
        "Dune",
        "Slender floor dome",
        "A slender floor dome with fine layer lines that catch light like wind on sand.",
        390,
        CAT_IDS.lighting,
        "Lighting",
        [SPACE_IDS.lounge, SPACE_IDS.dining],
        ["asset:p-floor.jpg"],
        false,
      ),
      makeProduct(
        7,
        "weave",
        "Weave",
        "Woven pendant",
        "A woven-pattern pendant that scatters soft patterned light over a table.",
        220,
        CAT_IDS.lighting,
        "Lighting",
        [SPACE_IDS.dining, SPACE_IDS.cafe],
        ["asset:p-pendant.jpg"],
        false,
      ),
      makeProduct(
        8,
        "atelier",
        "Atelier",
        "Brass task lamp",
        "A focused task lamp with a brass-tone finish for desks and work corners.",
        295,
        CAT_IDS.lighting,
        "Lighting",
        [SPACE_IDS.study],
        ["asset:p-brass.jpg"],
        false,
      ),
      makeProduct(
        9,
        "cap",
        "Cap",
        "Terracotta mushroom",
        "A terracotta-toned mushroom lamp — playful in shape, calm in glow.",
        180,
        CAT_IDS.lighting,
        "Lighting",
        [SPACE_IDS.suite, SPACE_IDS.cafe],
        ["asset:p-mushroom.jpg"],
        false,
      ),
      makeProduct(
        10,
        "lumen",
        "Lumen",
        "Ribbed glass lantern",
        "A ribbed lantern whose layers fold light into gentle stripes.",
        210,
        CAT_IDS.lighting,
        "Lighting",
        [SPACE_IDS.dining, SPACE_IDS.cafe],
        ["asset:p-lantern.jpg"],
        false,
      ),
      makeProduct(
        11,
        "ripple",
        "Ripple",
        "Wave-ribbed vase",
        "A wave-ribbed vase that turns dried stems and single blooms into sculpture.",
        150,
        CAT_IDS.vases,
        "Vases & Planters",
        [SPACE_IDS.lounge, SPACE_IDS.dining],
        ["asset:cat-vases.jpg"],
        false,
      ),
      makeProduct(
        12,
        "arch",
        "Arch",
        "Sculptural ceramic form",
        "A sculptural object to anchor a shelf, console or desk.",
        120,
        CAT_IDS.collectibles,
        "Collectibles",
        [SPACE_IDS.lounge, SPACE_IDS.study],
        ["asset:tile-collectibles.jpg"],
        false,
      ),
      makeProduct(
        13,
        "stack",
        "Stack",
        "Desk organiser & pen cup",
        "A stackable organiser and pen cup that keeps a desk clear and considered.",
        135,
        CAT_IDS.desk,
        "Desk Essentials",
        [SPACE_IDS.study],
        ["asset:cat-desk.jpg"],
        false,
      ),
      makeProduct(
        100,
        "pit-stop-pen-stack",
        "Pit Stop Pen Stack",
        "F1 tyre-stack pen holder",
        "A stack of race tyres that keeps your pens in pole position.",
        899,
        CAT_IDS.statement,
        "Collectibles",
        [],
        ["asset:c-tirestack.jpg"],
        true,
        "culture",
        {
          long: "Printed tyre by tyre with an orange stripe, it holds pens, markers and brushes on any desk that likes speed.",
          is_drop: true,
          colors: [
            { name: "Track Charcoal", hex: "#242426", images: [] },
            { name: "Apex Orange", hex: "#FF6B2C", images: [] },
            { name: "Electric Blue", hex: "#2563EB", images: [] },
            { name: "Chalk Cream", hex: "#F4EFE6", images: [] },
            { name: "Signal Red", hex: "#DC2626", images: [] },
          ],
        },
      ),
      makeProduct(
        101,
        "puffer-caddy",
        "Puffer Caddy",
        "Quilted desk organiser",
        "A puffer-jacket desk caddy with three pockets for your daily kit.",
        1199,
        CAT_IDS.quirkyDesk,
        "Desk Essentials",
        [],
        ["asset:c-puffer.jpg"],
        true,
        "culture",
        {
          long: "Quilted panels and a printed zip, in electric blue. Fits pens, scissors, sticky notes and your phone.",
          is_drop: true,
          colors: [
            { name: "Electric Blue", hex: "#2563EB", images: [] },
            { name: "Pop Orange", hex: "#FF6B2C", images: [] },
            { name: "Bone Cream", hex: "#F4EFE6", images: [] },
            { name: "Obsidian", hex: "#1E1E22", images: [] },
          ],
        },
      ),
      makeProduct(
        102,
        "cosmo-cat",
        "Cosmo Cat",
        "Collectible figurine",
        "An original astronaut cat collectible, printed and hand-finished.",
        1499,
        CAT_IDS.collectibles,
        "Collectibles",
        [],
        ["asset:c-figurine.jpg"],
        true,
        "culture",
        {
          long: "Our own character, about 14 cm tall, in pop orange and blue on a cream pedestal.",
          is_drop: true,
          colors: [
            { name: "Pop Orange", hex: "#FF6B2C", images: [] },
            { name: "Cobalt Blue", hex: "#2563EB", images: [] },
            { name: "Starlight Cream", hex: "#F4EFE6", images: [] },
            { name: "Graphite", hex: "#2E2B28", images: [] },
          ],
        },
      ),
    ],
    reviews: [],
    coupons: [],
    orders: [],
    order_events: [],
    custom_requests: [],
    saved_designs: [],
    addresses: [],
    profiles: [],
    saved_payment_methods: [],
    submissions: [],
    admin_notifications: [],
    admin_settings: [
      {
        id: true,
        email_on: false,
        whatsapp_on: false,
        notify_email: null,
        notify_whatsapp: null,
        updated_at: now,
      },
    ],
    product_inventory: [],
    user_roles: [],
  };
}

const tables: Record<string, Row[]> = createInitialTables();

type MockUser = {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: Record<string, unknown>;
};

type MockSession = {
  access_token: string;
  user: MockUser;
};

type AuthListener = (event: string, session: MockSession | null) => void;
const authListeners = new Set<AuthListener>();
let currentSession: MockSession | null = null;

function notifyAuth(event: string, session: MockSession | null) {
  for (const fn of authListeners) {
    try {
      fn(event, session);
    } catch {
      // ignore listener errors
    }
  }
}

function makeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `mock-${Math.random().toString(36).slice(2, 11)}`;
}

function createQueryBuilder(tableName: string) {
  const rows = () => (tables[tableName] ??= []);
  const filters: Array<(r: Row) => boolean> = [];
  const orders: Array<{ col: string; asc: boolean }> = [];
  let maxRows: number | null = null;
  let mode: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  let payload: Row | Row[] | null = null;
  let headOnly = false;
  let wantCount = false;
  let expectSingle: "single" | "maybeSingle" | null = null;

  const applyFilters = (list: Row[]) => list.filter((r) => filters.every((f) => f(r)));

  const execute = (): { data: unknown; error: null; count?: number } => {
    const now = new Date().toISOString();
    const list = rows();

    if (mode === "insert" && payload) {
      const items = (Array.isArray(payload) ? payload : [payload]).map((item) => ({
        id: makeId(),
        created_at: now,
        updated_at: now,
        ...item,
      }));
      list.push(...items);
      const out = expectSingle ? (items[0] ?? null) : items;
      return { data: out, error: null };
    }

    if (mode === "upsert" && payload) {
      const items = Array.isArray(payload) ? payload : [payload];
      const out: Row[] = [];
      for (const item of items) {
        const idx = list.findIndex(
          (r) =>
            (item["id"] !== undefined && r["id"] === item["id"]) ||
            (tableName === "site_content" && r["key"] === item["key"]),
        );
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...item, updated_at: now };
          out.push(list[idx]!);
        } else {
          const created = { id: makeId(), created_at: now, updated_at: now, ...item };
          list.push(created);
          out.push(created);
        }
      }
      return { data: expectSingle ? (out[0] ?? null) : out, error: null };
    }

    if (mode === "update" && payload && !Array.isArray(payload)) {
      const matched = applyFilters(list);
      for (const r of matched) {
        Object.assign(r, payload, { updated_at: now });
      }
      return { data: expectSingle ? (matched[0] ?? null) : matched, error: null };
    }

    if (mode === "delete") {
      const kept = list.filter((r) => !filters.every((f) => f(r)));
      tables[tableName] = kept;
      return { data: null, error: null };
    }

    let result = [...applyFilters(list)];
    for (const o of orders.slice().reverse()) {
      result.sort((a, b) => {
        const av = a[o.col];
        const bv = b[o.col];
        if (av === bv) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        const cmp = av < bv ? -1 : 1;
        return o.asc ? cmp : -cmp;
      });
    }
    const totalCount = result.length;
    if (maxRows !== null) result = result.slice(0, maxRows);

    if (headOnly) {
      return { data: null, error: null, ...(wantCount ? { count: totalCount } : {}) };
    }
    if (expectSingle === "single" || expectSingle === "maybeSingle") {
      return { data: result[0] ?? null, error: null, ...(wantCount ? { count: totalCount } : {}) };
    }
    return { data: result, error: null, ...(wantCount ? { count: totalCount } : {}) };
  };

  const builder = {
    select(_columns?: string, opts?: { count?: string; head?: boolean }) {
      if (opts?.count) wantCount = true;
      if (opts?.head) headOnly = true;
      return builder;
    },
    insert(data: Row | Row[]) {
      mode = "insert";
      payload = data;
      return builder;
    },
    update(data: Row) {
      mode = "update";
      payload = data;
      return builder;
    },
    upsert(data: Row | Row[], _opts?: { onConflict?: string }) {
      mode = "upsert";
      payload = data;
      return builder;
    },
    delete() {
      mode = "delete";
      return builder;
    },
    eq(col: string, val: unknown) {
      filters.push((r) => r[col] === val);
      return builder;
    },
    neq(col: string, val: unknown) {
      filters.push((r) => r[col] !== val);
      return builder;
    },
    is(col: string, val: unknown) {
      filters.push((r) => (val === null ? r[col] == null : r[col] === val));
      return builder;
    },
    gte(col: string, val: unknown) {
      filters.push((r) => String(r[col] ?? "") >= String(val ?? ""));
      return builder;
    },
    contains(col: string, val: unknown[]) {
      filters.push(
        (r) => Array.isArray(r[col]) && val.every((v) => (r[col] as unknown[]).includes(v)),
      );
      return builder;
    },
    order(col: string, opts?: { ascending?: boolean }) {
      orders.push({ col, asc: opts?.ascending !== false });
      return builder;
    },
    limit(n: number) {
      maxRows = n;
      return builder;
    },
    single() {
      expectSingle = "single";
      return builder;
    },
    maybeSingle() {
      expectSingle = "maybeSingle";
      return builder;
    },
    then<TResult1 = ReturnType<typeof execute>, TResult2 = never>(
      onfulfilled?:
        ((value: ReturnType<typeof execute>) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) {
      return Promise.resolve(execute()).then(onfulfilled, onrejected);
    },
  };

  return builder;
}

export function getMockSiteData() {
  const contentList = tables["site_content"] ?? [];
  const categories = [...(tables["categories"] ?? [])].sort(
    (a, b) => Number(a["sort"] ?? 0) - Number(b["sort"] ?? 0),
  );
  const spaces = [...(tables["spaces"] ?? [])].sort(
    (a, b) => Number(a["sort"] ?? 0) - Number(b["sort"] ?? 0),
  );
  const products = [...(tables["products"] ?? [])]
    .filter((p) => p["published"] !== false)
    .sort((a, b) => Number(a["sort"] ?? 0) - Number(b["sort"] ?? 0));

  return {
    content: Object.fromEntries(
      contentList.map((r) => [String(r["key"]), r["data"] as Json]),
    ) as Record<string, Json>,
    categories: categories as Database["public"]["Tables"]["categories"]["Row"][],
    spaces: spaces as Database["public"]["Tables"]["spaces"]["Row"][],
    products: products as Database["public"]["Tables"]["products"]["Row"][],
  };
}

export function createMockSupabaseClient(): SupabaseClient<Database> {
  const client = {
    from: (table: string) => createQueryBuilder(table),
    rpc: async (fn: string, _args?: Record<string, unknown>) => {
      if (fn === "has_role") return { data: false, error: null };
      if (fn === "check_coupon")
        return { data: { ok: false, message: "Invalid or expired code." }, error: null };
      if (fn === "accept_custom_quote") return { data: null, error: null };
      return { data: null, error: null };
    },
    storage: {
      from: (_bucket: string) => ({
        upload: async (path: string) => ({ data: { path }, error: null }),
        download: async (_path: string) => ({ data: null, error: new Error("Not found") }),
        createSignedUrl: async (_path: string, _ttl: number) => ({
          data: { signedUrl: "" },
          error: null,
        }),
        createSignedUrls: async (_paths: string[], _ttl: number) => ({ data: [], error: null }),
      }),
    },
    channel: (_name: string) => {
      const ch = {
        on: () => ch,
        subscribe: () => ch,
      };
      return ch;
    },
    removeChannel: async () => "ok",
    auth: {
      getUser: async () => ({ data: { user: currentSession?.user ?? null }, error: null }),
      getSession: async () => ({ data: { session: currentSession }, error: null }),
      getClaims: async () => ({
        data: currentSession
          ? { claims: { sub: currentSession.user.id, email: currentSession.user.email } }
          : null,
        error: currentSession ? null : new Error("No active session"),
      }),
      onAuthStateChange: (cb: AuthListener) => {
        authListeners.add(cb);
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                authListeners.delete(cb);
              },
            },
          },
        };
      },
      signInWithPassword: async ({ email }: { email: string; password: string }) => {
        const user: MockUser = { id: makeId(), email };
        currentSession = { access_token: `mock-token-${user.id}`, user };
        notifyAuth("SIGNED_IN", currentSession);
        return { data: { user, session: currentSession }, error: null };
      },
      signUp: async ({
        email,
        options,
      }: {
        email: string;
        password: string;
        options?: { data?: Record<string, unknown> };
      }) => {
        const user: MockUser = { id: makeId(), email, user_metadata: options?.data ?? {} };
        currentSession = { access_token: `mock-token-${user.id}`, user };
        tables["profiles"]?.push({
          id: user.id,
          email,
          full_name: String(options?.data?.["full_name"] ?? ""),
          phone: null,
          avatar: null,
          created_at: new Date().toISOString(),
        });
        notifyAuth("SIGNED_IN", currentSession);
        return { data: { user, session: currentSession }, error: null };
      },
      signInWithOtp: async () => ({
        data: { user: null, session: null },
        error: new Error("SMS/Email OTP requires Supabase configuration."),
      }),
      verifyOtp: async () => ({
        data: { user: null, session: null },
        error: new Error("OTP verification requires Supabase configuration."),
      }),
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      updateUser: async () => ({ data: { user: currentSession?.user ?? null }, error: null }),
      setSession: async (tokens: { access_token: string; refresh_token: string }) => {
        currentSession = {
          access_token: tokens.access_token,
          user: { id: makeId(), email: "user@example.com" },
        };
        notifyAuth("SIGNED_IN", currentSession);
        return { data: { session: currentSession, user: currentSession.user }, error: null };
      },
      signOut: async () => {
        currentSession = null;
        notifyAuth("SIGNED_OUT", null);
        return { error: null };
      },
      admin: {
        getUserById: async (id: string) => ({ data: { user: { id, email: null } }, error: null }),
        updateUserById: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
    },
  };

  return client as unknown as SupabaseClient<Database>;
}
