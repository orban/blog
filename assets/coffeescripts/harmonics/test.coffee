class A
  meth: (arg) =>
    console.log("Argument: #{arg}, this: #{this} that: #{if that? then that.something else "undefined"}")

x = new A
x.meth(1)
x.meth.call({something: true}, 2)
