/* components/admin/ModForm.tsx */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Save,
    X,
    Plus,
    Trash2,
    AlertCircle,
    AlertTriangle,
} from "lucide-react";
import {
    ModPost,
    ModType,
    ModStatus,
    ModFeature,
    RiskLevel,
    ModFormData,
    VersionFormData,
} from "@/lib/mods/types";
import { createMod, updateMod, addVersion, isSlugUnique } from "@/lib/mods/service";

interface ModFormProps {
    mod?: ModPost;
    isEdit?: boolean;
}

const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
    { value: "none", label: "None" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
];

const STATUS_OPTIONS: { value: ModStatus; label: string }[] = [
    { value: "stable", label: "Stable" },
    { value: "beta", label: "Beta" },
    { value: "experimental", label: "Experimental" },
];

export function ModForm({ mod, isEdit = false }: ModFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [name, setName] = useState(mod?.name || "");
    const [slug, setSlug] = useState(mod?.slug || "");
    const [game, setGame] = useState(mod?.game || "");
    const [type, setType] = useState<ModType>(mod?.type || "script");
    const [published, setPublished] = useState(mod?.published || false);
    const [description, setDescription] = useState(mod?.description || "");
    const [features, setFeatures] = useState<ModFeature[]>(mod?.features || []);
    const [requirements, setRequirements] = useState<string[]>(mod?.requirements || []);
    const [installationSteps, setInstallationSteps] = useState<string[]>(mod?.installationSteps || []);
    const [warnings, setWarnings] = useState<string[]>(mod?.warnings || []);

    // Version (only for new mods)
    const [versionNumber, setVersionNumber] = useState("");
    const [versionStatus, setVersionStatus] = useState<ModStatus>("stable");
    const [versionFileSize, setVersionFileSize] = useState("");
    const [versionDownloadSlug, setVersionDownloadSlug] = useState("");
    const [versionDownloadUrl, setVersionDownloadUrl] = useState("");
    const [versionChangelog, setVersionChangelog] = useState<string[]>([]);

    // Auto-generate slug from name
    const handleNameChange = (value: string) => {
        setName(value);
        if (!isEdit) {
            const generatedSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            setSlug(generatedSlug);
        }
    };

    // Feature management
    const addFeature = () => {
        setFeatures([...features, { text: "", risk: "none" }]);
    };

    const updateFeature = (index: number, field: keyof ModFeature, value: string) => {
        const updated = [...features];
        updated[index] = { ...updated[index], [field]: value };
        setFeatures(updated);
    };

    const removeFeature = (index: number) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    // String array management
    const addArrayItem = (array: string[], setArray: (arr: string[]) => void) => {
        setArray([...array, ""]);
    };

    const updateArrayItem = (array: string[], setArray: (arr: string[]) => void, index: number, value: string) => {
        const updated = [...array];
        updated[index] = value;
        setArray(updated);
    };

    const removeArrayItem = (array: string[], setArray: (arr: string[]) => void, index: number) => {
        setArray(array.filter((_, i) => i !== index));
    };

    // Changelog management
    const addChangelogItem = () => {
        setVersionChangelog([...versionChangelog, ""]);
    };

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate required fields
            if (!name.trim()) throw new Error("Name is required");
            if (!slug.trim()) throw new Error("Slug is required");
            if (!game.trim()) throw new Error("Game is required");
            if (!description.trim()) throw new Error("Description is required");

            // Validate slug uniqueness
            const slugUnique = await isSlugUnique(slug, mod?.id);
            if (!slugUnique) throw new Error("Slug is already taken");

            // Prepare form data
            const formData: ModFormData = {
                name: name.trim(),
                slug: slug.trim(),
                game: game.trim(),
                type,
                published,
                description: description.trim(),
                features: features.filter(f => f.text.trim()),
                requirements: requirements.filter(r => r.trim()),
                installationSteps: installationSteps.filter(s => s.trim()),
                warnings: warnings.filter(w => w.trim()),
            };

            if (isEdit && mod) {
                // Update existing mod
                await updateMod(mod.id, formData);
                router.push("/admin/mods");
            } else {
                // Create new mod with initial version
                if (!versionNumber.trim()) throw new Error("Version number is required for new mods");
                if (!versionDownloadSlug.trim()) throw new Error("Download slug is required for new mods");
                if (!versionDownloadUrl.trim()) throw new Error("Download URL is required");

                const versionData: VersionFormData = {
                    version: versionNumber.trim(),
                    status: versionStatus,
                    fileSize: versionFileSize.trim() || "Unknown",
                    downloadSlug: versionDownloadSlug.trim(),
                    downloadUrl: versionDownloadUrl.trim(),
                    changelog: versionChangelog.filter(c => c.trim()),
                };

                await createMod(formData, versionData);
                router.push("/admin/mods");
            }
        } catch (err) {
            console.error("Failed to save mod:", err);
            setError(err instanceof Error ? err.message : "Failed to save mod");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="admin-form" onSubmit={handleSubmit}>
            {error && (
                <div className="admin-form-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* Basic Info Section */}
            <section className="admin-form-section">
                <h2 className="admin-form-section-title">Basic Info</h2>

                <div className="admin-form-row">
                    <div className="admin-form-field">
                        <label className="admin-form-label">Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className="admin-form-input"
                            placeholder="e.g., Swordash God Mode"
                            required
                        />
                    </div>
                    <div className="admin-form-field">
                        <label className="admin-form-label">Slug *</label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="admin-form-input"
                            placeholder="e.g., swordash-god-mode"
                            required
                        />
                        <span className="admin-form-hint">/mods/{slug || "..."}</span>
                    </div>
                </div>

                <div className="admin-form-row">
                    <div className="admin-form-field">
                        <label className="admin-form-label">Game *</label>
                        <input
                            type="text"
                            value={game}
                            onChange={(e) => setGame(e.target.value)}
                            className="admin-form-input"
                            placeholder="e.g., Swordash"
                            required
                        />
                    </div>
                    <div className="admin-form-field">
                        <label className="admin-form-label">Type *</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as ModType)}
                            className="admin-form-select"
                        >
                            <option value="script">Script</option>
                            <option value="mod">Mod APK</option>
                        </select>
                    </div>
                </div>

                <div className="admin-form-field">
                    <label className="admin-form-checkbox">
                        <input
                            type="checkbox"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                        />
                        <span>Published</span>
                    </label>
                    <span className="admin-form-hint">Unpublished mods are only visible to admins</span>
                </div>
            </section>

            {/* Content Section */}
            <section className="admin-form-section">
                <h2 className="admin-form-section-title">Content</h2>

                <div className="admin-form-field">
                    <label className="admin-form-label">Description *</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="admin-form-textarea"
                        rows={4}
                        placeholder="Describe what this mod does..."
                        required
                    />
                </div>

                {/* Features */}
                <div className="admin-form-field">
                    <label className="admin-form-label">Features</label>
                    <div className="admin-form-array">
                        {features.map((feature, idx) => (
                            <div key={idx} className="admin-form-array-item admin-form-array-item--feature">
                                <input
                                    type="text"
                                    value={feature.text}
                                    onChange={(e) => updateFeature(idx, "text", e.target.value)}
                                    className="admin-form-input"
                                    placeholder="Feature description"
                                />
                                <select
                                    value={feature.risk}
                                    onChange={(e) => updateFeature(idx, "risk", e.target.value)}
                                    className="admin-form-select admin-form-select--small"
                                >
                                    {RISK_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {feature.risk !== "none" && (
                                    <input
                                        type="text"
                                        value={feature.riskNote || ""}
                                        onChange={(e) => updateFeature(idx, "riskNote", e.target.value)}
                                        className="admin-form-input admin-form-input--small"
                                        placeholder="Risk note (optional)"
                                    />
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeFeature(idx)}
                                    className="admin-form-remove-btn"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addFeature} className="admin-form-add-btn">
                            <Plus size={14} />
                            <span>Add Feature</span>
                        </button>
                    </div>
                </div>

                {/* Requirements */}
                <div className="admin-form-field">
                    <label className="admin-form-label">Requirements</label>
                    <div className="admin-form-array">
                        {requirements.map((req, idx) => (
                            <div key={idx} className="admin-form-array-item">
                                <input
                                    type="text"
                                    value={req}
                                    onChange={(e) => updateArrayItem(requirements, setRequirements, idx, e.target.value)}
                                    className="admin-form-input"
                                    placeholder="e.g., Android 8.0+"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem(requirements, setRequirements, idx)}
                                    className="admin-form-remove-btn"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayItem(requirements, setRequirements)}
                            className="admin-form-add-btn"
                        >
                            <Plus size={14} />
                            <span>Add Requirement</span>
                        </button>
                    </div>
                </div>

                {/* Installation Steps */}
                <div className="admin-form-field">
                    <label className="admin-form-label">Installation Steps</label>
                    <div className="admin-form-array">
                        {installationSteps.map((step, idx) => (
                            <div key={idx} className="admin-form-array-item">
                                <span className="admin-form-array-index">{idx + 1}.</span>
                                <input
                                    type="text"
                                    value={step}
                                    onChange={(e) => updateArrayItem(installationSteps, setInstallationSteps, idx, e.target.value)}
                                    className="admin-form-input"
                                    placeholder="Installation step"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem(installationSteps, setInstallationSteps, idx)}
                                    className="admin-form-remove-btn"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayItem(installationSteps, setInstallationSteps)}
                            className="admin-form-add-btn"
                        >
                            <Plus size={14} />
                            <span>Add Step</span>
                        </button>
                    </div>
                </div>

                {/* Warnings */}
                <div className="admin-form-field">
                    <label className="admin-form-label">
                        <AlertTriangle size={14} />
                        <span>Warnings</span>
                    </label>
                    <div className="admin-form-array">
                        {warnings.map((warning, idx) => (
                            <div key={idx} className="admin-form-array-item">
                                <input
                                    type="text"
                                    value={warning}
                                    onChange={(e) => updateArrayItem(warnings, setWarnings, idx, e.target.value)}
                                    className="admin-form-input"
                                    placeholder="Warning message"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem(warnings, setWarnings, idx)}
                                    className="admin-form-remove-btn"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addArrayItem(warnings, setWarnings)}
                            className="admin-form-add-btn"
                        >
                            <Plus size={14} />
                            <span>Add Warning</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Version Section (only for new mods) */}
            {!isEdit && (
                <section className="admin-form-section">
                    <h2 className="admin-form-section-title">Initial Version</h2>

                    <div className="admin-form-row">
                        <div className="admin-form-field">
                            <label className="admin-form-label">Version *</label>
                            <input
                                type="text"
                                value={versionNumber}
                                onChange={(e) => setVersionNumber(e.target.value)}
                                className="admin-form-input"
                                placeholder="e.g., 1.0.0"
                                required
                            />
                        </div>
                        <div className="admin-form-field">
                            <label className="admin-form-label">Status</label>
                            <select
                                value={versionStatus}
                                onChange={(e) => setVersionStatus(e.target.value as ModStatus)}
                                className="admin-form-select"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="admin-form-row">
                        <div className="admin-form-field">
                            <label className="admin-form-label">File Size</label>
                            <input
                                type="text"
                                value={versionFileSize}
                                onChange={(e) => setVersionFileSize(e.target.value)}
                                className="admin-form-input"
                                placeholder="e.g., 2.5 MB"
                            />
                        </div>
                        <div className="admin-form-field">
                            <label className="admin-form-label">Download Slug *</label>
                            <input
                                type="text"
                                value={versionDownloadSlug}
                                onChange={(e) => setVersionDownloadSlug(e.target.value)}
                                className="admin-form-input"
                                placeholder="e.g., swordash-v1"
                                required
                            />
                            <span className="admin-form-hint">/d/{versionDownloadSlug || "..."}</span>
                        </div>
                    </div>

                    <div className="admin-form-field">
                        <label className="admin-form-label">Download URL *</label>
                        <input
                            type="url"
                            value={versionDownloadUrl}
                            onChange={(e) => setVersionDownloadUrl(e.target.value)}
                            className="admin-form-input"
                            placeholder="e.g., https://github.com/user/repo/releases/download/v1.0.0/mod.apk"
                            required
                        />
                    </div>

                    <div className="admin-form-field">
                        <label className="admin-form-label">Changelog</label>
                        <div className="admin-form-array">
                            {versionChangelog.map((entry, idx) => (
                                <div key={idx} className="admin-form-array-item">
                                    <input
                                        type="text"
                                        value={entry}
                                        onChange={(e) => updateArrayItem(versionChangelog, setVersionChangelog, idx, e.target.value)}
                                        className="admin-form-input"
                                        placeholder="Change description"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem(versionChangelog, setVersionChangelog, idx)}
                                        className="admin-form-remove-btn"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={addChangelogItem} className="admin-form-add-btn">
                                <Plus size={14} />
                                <span>Add Entry</span>
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Form Actions */}
            <div className="admin-form-actions">
                <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    onClick={() => router.push("/admin/mods")}
                    disabled={loading}
                >
                    <X size={16} />
                    <span>Cancel</span>
                </button>
                <button
                    type="submit"
                    className="admin-btn admin-btn--primary"
                    disabled={loading}
                >
                    <Save size={16} />
                    <span>{loading ? "Saving..." : isEdit ? "Update Mod" : "Create Mod"}</span>
                </button>
            </div>
        </form>
    );
}
