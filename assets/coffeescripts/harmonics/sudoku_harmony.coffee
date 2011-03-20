#Reference Type: Book Chapter
#Editor: Apolloni, Bruno
#Editor: Howlett, Robert
#Editor: Jain, Lakhmi
#Author: Geem, Zong
#Primary Title: Harmony Search Algorithm for Solving Sudoku
#Book Title: Knowledge-Based Intelligent Information and Engineering Systems
#Book Series Title: Lecture Notes in Computer Science
#Copyright: 2007
#Publisher: Springer Berlin / Heidelberg
#Isbn: 
#Start Page: 371
#End Page: 378
#Volume: 4692
#Url: http://dx.doi.org/10.1007/978-3-540-74819-9_46
#Doi: 10.1007/978-3-540-74819-9_46
#Rights Link Reuse lisence 2632250476601

class Harry.SudokuHarmony extends Harry.Harmony
  @classForPuzzle: (puzzle) ->

    # Calculate where the unknowns in the puzzle are. While doing so
    # generate an ordered list of where the notes in the harmony should
    # go in the puzzle
    unsolvedCount = 0
    nums = []
    for row in [0..8]
      nums[row] = []
      for col in [0..8]
        char = puzzle.charAt(row*9+col)
        if char == "."
          unsolvedCount++
        else
          nums[row][col] = parseInt(char)

    class PuzzleSolver extends Harry.SudokuHarmony
      @unsolvedCount: unsolvedCount
      unsolved: nums



    return PuzzleSolver
  
  unsolved: [] for i in [0..8]
  constructor: ->
    super
    k = 0
    @nums = []
    for row in [0..8]
      @nums[row] = []
      for col in [0..8]
        @nums[row][col] = if @unsolved[row][col]? then @unsolved[row][col] else @notes[k++]

  calculateQuality: ->
    sum = (ar) ->
      l = ar.length - 1
      t = 0
      for x in [0..l]
        t = ar[x]

    horiz = 0
    for row in [0..8]
      r = -45
      for col in [0..8]
        r += @nums[row][col]
      horiz += Math.abs(r)

    vert = 0
    for col in [0..8]
      c = -45
      for row in [0..8]
        c += @nums[row][col]
      vert += Math.abs(c)

    boxes = 0
    for box_x in [0..8] by 3
      for box_y in [0..8] by 3
        box = -45
        for row in [0..2]
          for col in [0..2]
            box += @nums[box_y+row][box_x+col]
        boxes += Math.abs(box)
  
    return 135 - vert - horiz - boxes
