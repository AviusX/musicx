"use client";

import { motion } from "motion/react";

interface DeleteModalProps {
	itemTitle: string;
	onConfirm: () => void;
	onCancel: () => void;
}

export default function DeleteModal({
	itemTitle,
	onConfirm,
	onCancel,
}: DeleteModalProps) {
	return (
		<motion.div
			className="delete-modal-overlay"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
			onClick={onCancel}
		>
			<motion.div
				className="delete-modal glass-card"
				initial={{ opacity: 0, scale: 0.9, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.9, y: 20 }}
				transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
				onClick={(e) => e.stopPropagation()}
			>
				<h3 className="delete-modal-title">Delete Recommendation</h3>
				<p className="delete-modal-text">
					Are you sure you want to delete{" "}
					<strong>&ldquo;{itemTitle}&rdquo;</strong>? This action cannot be
					undone.
				</p>
				<div className="delete-modal-actions">
					<motion.button
						className="delete-modal-cancel"
						onClick={onCancel}
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.97 }}
						transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
					>
						Cancel
					</motion.button>
					<motion.button
						className="delete-modal-confirm"
						onClick={onConfirm}
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.97 }}
						transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
					>
						Delete
					</motion.button>
				</div>
			</motion.div>
		</motion.div>
	);
}
