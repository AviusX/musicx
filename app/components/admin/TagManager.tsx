"use client";

import { useState } from "react";
import Modal from "../Modal";
import { createTag, deleteTag, renameTag } from "@/app/actions";
import type { Tag } from "@/lib/types";

interface TagManagerProps {
	tags: Tag[];
	onClose: () => void;
	onChanged: () => void;
}

function TagRow({
	tag,
	onChanged,
	setError,
}: {
	tag: Tag;
	onChanged: () => void;
	setError: (e: string | null) => void;
}) {
	const [name, setName] = useState(tag.name);
	const [confirming, setConfirming] = useState(false);
	const [busy, setBusy] = useState(false);

	// Sync the input when the server-refreshed prop changes.
	const [prevName, setPrevName] = useState(tag.name);
	if (prevName !== tag.name) {
		setPrevName(tag.name);
		setName(tag.name);
	}

	const dirty = name.trim() !== tag.name && name.trim() !== "";

	const handleRename = async () => {
		if (!dirty || busy) return;
		setBusy(true);
		setError(null);
		const result = await renameTag(tag.id, name);
		setBusy(false);
		if (result.ok) {
			onChanged();
		} else {
			setError(result.error);
		}
	};

	const handleDelete = async () => {
		if (!confirming) {
			setConfirming(true);
			setTimeout(() => setConfirming(false), 3500);
			return;
		}
		setBusy(true);
		setError(null);
		const result = await deleteTag(tag.id);
		setBusy(false);
		setConfirming(false);
		if (result.ok) {
			onChanged();
		} else {
			setError(result.error);
		}
	};

	return (
		<li className="flex items-center gap-3 border border-line px-3 py-2.5">
			<input
				type="text"
				aria-label={`Rename tag ${tag.name}`}
				className="min-w-0 grow bg-transparent font-mono text-[0.72rem] uppercase tracking-[0.14em] text-foreground outline-none"
				value={name}
				onChange={(e) => setName(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						handleRename();
					}
				}}
			/>
			{dirty && (
				<button
					type="button"
					onClick={handleRename}
					disabled={busy}
					className="label shrink-0 !text-accent transition-opacity disabled:opacity-40"
				>
					Save
				</button>
			)}
			<button
				type="button"
				onClick={handleDelete}
				disabled={busy}
				className={`label shrink-0 transition-colors disabled:opacity-40 ${
					confirming ? "!text-accent" : "!text-muted hover:!text-accent"
				}`}
			>
				{confirming ? "Sure?" : "Delete"}
			</button>
		</li>
	);
}

export default function TagManager({ tags, onClose, onChanged }: TagManagerProps) {
	const [newName, setNewName] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleAdd = async () => {
		const name = newName.trim();
		if (!name || busy) return;
		setBusy(true);
		setError(null);
		const result = await createTag(name);
		setBusy(false);
		if (result.ok) {
			setNewName("");
			onChanged();
		} else {
			setError(result.error);
		}
	};

	return (
		<Modal title="Manage tags" onClose={onClose}>
			<div className="flex flex-col gap-4">
				<p className="text-sm leading-relaxed text-muted">
					Renames apply everywhere instantly. Deleting a tag removes it from
					every track — the tracks themselves stay put.
				</p>

				<div className="flex items-center gap-2">
					<input
						type="text"
						aria-label="New tag name"
						className="field font-mono !text-[0.72rem] uppercase tracking-[0.14em]"
						placeholder="new tag name"
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleAdd();
							}
						}}
					/>
					<button
						type="button"
						onClick={handleAdd}
						disabled={!newName.trim() || busy}
						className="label shrink-0 border border-dashed border-line px-3 py-2.5 transition-colors hover:border-accent hover:!text-accent disabled:opacity-40"
					>
						+ Add
					</button>
				</div>

				{error && (
					<p className="border border-accent/40 bg-accent/5 px-4 py-2.5 text-sm text-accent" role="alert">
						{error}
					</p>
				)}

				<ul className="flex flex-col gap-2">
					{tags.map((tag) => (
						<TagRow key={tag.id} tag={tag} onChanged={onChanged} setError={setError} />
					))}
					{tags.length === 0 && (
						<li className="label py-4 text-center">No tags yet</li>
					)}
				</ul>
			</div>
		</Modal>
	);
}
