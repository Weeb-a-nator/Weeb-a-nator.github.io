"""Command-line Stableford golf score calculator."""


def stableford_points(gross_score: int, par: int, strokes_received: int = 0) -> int:
	"""Return Stableford points for one hole using the net score."""
	net_difference = gross_score - strokes_received - par
	return max(0, 2 - net_difference)


def strokes_for_hole(course_handicap: int, hole_handicap: int) -> int:
	"""Distribute a course handicap according to each hole's stroke index."""
	if course_handicap <= 0:
		return 0
	base, extra = divmod(course_handicap, 18)
	return base + (1 if hole_handicap <= extra else 0)


def calculate_score(pars, scores, hole_handicaps, course_handicap):
	"""Calculate each hole's points and the round total."""
	points = []
	for par, score, hole_handicap in zip(pars, scores, hole_handicaps):
		received = strokes_for_hole(course_handicap, hole_handicap)
		points.append(stableford_points(score, par, received))
	return points


def read_numbers(prompt, count, minimum=1):
	while True:
		try:
			values = [int(value) for value in input(prompt).split()]
			if len(values) != count or any(value < minimum for value in values):
				raise ValueError
			return values
		except ValueError:
			print(f"Enter exactly {count} whole numbers (minimum {minimum}).")


def read_number(prompt, minimum=1):
	return read_numbers(prompt, 1, minimum)[0]


def main():
	print("Stableford Score Calculator")
	holes = 9 if input("Number of holes (9 or 18) [18]: ").strip() == "9" else 18
	individual_holes = input("Enter each hole individually? (y/N): ").strip().lower() == "y"
	if individual_holes:
		pars = []
		scores = []
		default_handicaps = list(range(1, holes + 1))
		handicap_text = input(
			"Enter hole stroke indexes, or press Enter for 1..%d: " % holes
		).strip()
		hole_handicaps = (
			[int(value) for value in handicap_text.split()]
			if handicap_text
			else default_handicaps
		)
		if len(hole_handicaps) != holes or any(value < 1 for value in hole_handicaps):
			raise ValueError("Stroke indexes must contain one positive number per hole.")
		course_handicap = int(input("Course handicap [0]: ") or 0)
		points = []
		for hole in range(holes):
			par = read_number(f"Hole {hole + 1} par: ", 3)
			score = read_number(f"Hole {hole + 1} score: ")
			pars.append(par)
			scores.append(score)
			received = strokes_for_hole(course_handicap, hole_handicaps[hole])
			point = stableford_points(score, par, received)
			points.append(point)
			print(f"Hole {hole + 1}: {point} points (round total: {sum(points)})")
	else:
		pars = read_numbers(f"Enter the par for each of the {holes} holes: ", holes, 3)
		scores = read_numbers(f"Enter your score for each of the {holes} holes: ", holes, 1)
		default_handicaps = list(range(1, holes + 1))
		handicap_text = input(
			"Enter hole stroke indexes, or press Enter for 1..%d: " % holes
		).strip()
		hole_handicaps = (
			[int(value) for value in handicap_text.split()]
			if handicap_text
			else default_handicaps
		)
		if len(hole_handicaps) != holes or any(value < 1 for value in hole_handicaps):
			raise ValueError("Stroke indexes must contain one positive number per hole.")
		course_handicap = int(input("Course handicap [0]: ") or 0)
	points = calculate_score(pars, scores, hole_handicaps, course_handicap)

	print("\nHole:   " + " ".join(f"{i:2}" for i in range(1, holes + 1)))
	print("Points: " + " ".join(f"{point:2}" for point in points))
	print(f"\nStableford total: {sum(points)} points")
	if holes == 18:
		first_nine_strokes = sum(scores[:9])
		second_nine_strokes = sum(scores[9:])
		total_strokes = sum(scores)
		print(f"First 9 strokes: {first_nine_strokes}")
		print(f"Second 9 strokes: {second_nine_strokes}")
		print(f"Total strokes: {total_strokes}")
	else:
		print(f"Total strokes: {sum(scores)}")


if __name__ == "__main__":
	main()
