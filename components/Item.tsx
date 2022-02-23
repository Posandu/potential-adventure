import {
	CircularProgress,
	Dialog,
	DialogContent,
	IconButton,
} from "@mui/material";
import { useState, useEffect } from "react";
import { GoPencil } from "react-icons/go";
import { MdOutlineOpenInFull } from "react-icons/md";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { BsEye } from "react-icons/bs";
import EditItem from "./EditItem";

interface ItemProps {
	id: string;
	title?: string;
	description: string;
	bg?: string;
	ispublic?: boolean;
	tags?: string[];
	userid?: string;
	user: string;
}

function Item({
	id,
	title,
	description,
	bg,
	ispublic,
	tags,
	userid,
	user,
}: ItemProps) {
	const _bg = +bg || "no";
	const isbg = _bg > 0 && _bg <= 5 ? true : false;
	const escape = (str: string) => {
		return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	};
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [labels, setLabels] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	useEffect(() => {
		if (detailsOpen) {
			const _labels = fetch(
				process.env.NEXT_PUBLIC_URL + "/api/getItemLabels",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						id: id,
					}),
				}
			)
				.then((res) => res.json())
				.then((res) => {
					const labels = res.labels;
					if (labels.length > 0) {
						/**
						 * For each label, fetch the label name and color
						 */
						const labels_fetched = labels.map(
							async (label: { labelId: string }): Promise<any> =>
								fetch(`${process.env.NEXT_PUBLIC_URL}/api/getSingleLabel`, {
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({
										id: label.labelId,
									}),
								})
									.then((res) => res.json())
									.then((res) => {
										return res;
									})
						);

						Promise.all(labels_fetched).then((res) => {
							setLabels(res);
						});
						console.log(labels);
					}
					setLoading(false);
				});
		}
	}, [detailsOpen]);

	return (
		<>
			<style jsx>{`
				.box {
					${isbg
						? `
					background-image: url("/images/bg/${escape(_bg.toString())}.svg");
					background-size: cover;
					background-position: center;
					background-repeat: repeat;
					`
						: ""}
				}
			`}</style>
			<div className="p-4 mr-4 mt-4 mb-4 inline-block relative border rounded hover:shadow-sm box">
				{ispublic && (
					<p>
						<BsEye className="icon absolute top-2 left-2 pointer-events-none z-50 text-gray-300" />
					</p>
				)}

				<h1>{title}</h1>
				<p
					className="text-gray-700 text-sm shorter"
					style={{
						whiteSpace: "nowrap",
						width: "100%",
						overflow: "hidden",
						textOverflow: "ellipsis",
						maxWidth: "200px",
					}}
				>
					{description}
				</p>
				<div className="mt-2 text-gray-600">
					<IconButton
						size="small"
						className="mr-2"
						onClick={() => setDetailsOpen(true)}
					>
						<MdOutlineOpenInFull />
					</IconButton>
					{userid === user && (
						<IconButton
							size="small"
							onClick={() => {
								setEditDialogOpen(true);
								document.addEventListener("__close__dialog", () => {
									setEditDialogOpen(false);
								});
							}}
						>
							<GoPencil />
						</IconButton>
					)}
				</div>
			</div>

			<Dialog
				open={detailsOpen}
				onClose={() => setDetailsOpen(false)}
				fullWidth={true}
			>
				{loading && <CircularProgress className="m-4" />}
				<div className={`p-4 transition-all ${loading && "opacity-25"}`}>
					{labels && (
						<div className="mb-2">
							{labels.map((label: any, i: number) => {
								label = label.label;
								return (
									<div
										key={label.id + i}
										className={`color-${label.color} inline-block p-1 text-sm rounded mr-2`}
									>
										{label.name}
									</div>
								);
							})}
						</div>
					)}

					{title && <h1 className="shorter text-2xl mb-2">{title}</h1>}

					<ReactMarkdown
						rehypePlugins={[rehypeHighlight]}
						remarkPlugins={[remarkGfm]}
						className="Markdown mt-4 mb-4"
					>
						{description}
					</ReactMarkdown>

					{tags && tags.length > 0 && (
						<div className="mt-4 mb-2">
							{tags.map((tag, i) => (
								<span
									key={i}
									className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
								>
									{tag}
								</span>
							))}
						</div>
					)}

					<div className="mt-2 text-gray-600">
						<IconButton size="small" className="mr-2">
							<MdOutlineOpenInFull />
						</IconButton>
						<IconButton size="small">
							<GoPencil />
						</IconButton>
					</div>
				</div>
			</Dialog>

			<Dialog open={editDialogOpen}>
				<DialogContent>
					<EditItem id={id} />
				</DialogContent>
			</Dialog>
		</>
	);
}

export default Item;
