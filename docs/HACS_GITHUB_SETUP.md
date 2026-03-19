# GitHub settings for HACS validation

HACS checks **repository metadata** on GitHub (not files in this repo). If `hacs/action` fails **description** or **topics**, set them on GitHub:

## 1. Repository description

1. Open the repo on GitHub → **Settings** (or click the gear icon next to “About”).
2. Under **General** → **Repository name** section, find **Description**.
3. Paste for example:

   > Home Assistant custom integration: Smappee energy overview panel, EV charger control, sessions, and reimbursement helpers.

## 2. Topics

Still under **About**, add **Topics** (tags), for example:

- `home-assistant`
- `homeassistant`
- `hacs-integration`
- `custom-component`
- `smappee`
- `energy`
- `ev-charging`

Save. HACS requires at least one valid topic.

## 3. Brand assets (in-repo)

This integration ships:

`custom_components/ha_smappee_overview/brand/icon.png`

That satisfies the **brands** check without being listed in [home-assistant/brands](https://github.com/home-assistant/brands).

## 4. Other HACS checks (reference)

- **Issues** enabled on the repo (GitHub → Settings → General → Features).
- At least one **GitHub Release** (not only a tag) if you submit to the default HACS store.

See: [HACS publish / include](https://hacs.xyz/docs/publish/include).
