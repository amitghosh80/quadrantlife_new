import { Grid2x2 as Grid, Users, Target, Calendar, TrendingUp } from 'lucide-react';

export default function FeatureShowcase() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 lg:py-24">
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
          Everything You Need to Live Intentionally
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
          A complete system for organizing your tasks, aligning with your goals, and focusing on what truly matters.
        </p>
      </div>

      <div className="space-y-16 sm:space-y-24">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-semibold">
              <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
              Core Feature
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Eisenhower Matrix at Your Fingertips
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
              Organize every task into one of four quadrants based on urgency and importance. See at a glance where your time is going and make better decisions about what deserves your attention.
            </p>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full"></div>
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900">Do First:</span>
                  <span className="text-gray-600"> Urgent and important tasks</span>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900">Schedule:</span>
                  <span className="text-gray-600"> Important but not urgent</span>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full"></div>
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900">Delegate:</span>
                  <span className="text-gray-600"> Urgent but not important</span>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full"></div>
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900">Eliminate:</span>
                  <span className="text-gray-600"> Neither urgent nor important</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-red-900 text-sm">Do First</h4>
                    <span className="text-xs text-red-700 font-semibold">3</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-red-200">
                      <p className="text-sm font-semibold text-gray-900">Doctor's appointment</p>
                      <p className="text-xs text-gray-600 mt-1">Annual health checkup</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-red-200">
                      <p className="text-sm font-semibold text-gray-900">File tax extension</p>
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due today
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-blue-900 text-sm">Schedule</h4>
                    <span className="text-xs text-blue-700 font-semibold">5</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                      <p className="text-sm font-semibold text-gray-900">Plan family vacation</p>
                      <p className="text-xs text-gray-600 mt-1">Summer trip research</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-blue-200">
                      <p className="text-sm font-semibold text-gray-900">Start meditation practice</p>
                      <p className="text-xs text-gray-600 mt-1">Mental health & wellness</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-900 text-sm">Delegate</h4>
                    <span className="text-xs text-amber-700 font-semibold">2</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-amber-200">
                      <p className="text-sm font-semibold text-gray-900">Review team requests</p>
                      <p className="text-xs text-gray-600 mt-1">Can be handled by others</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-sm">Eliminate</h4>
                    <span className="text-xs text-gray-700 font-semibold">1</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">Browse social media</p>
                      <p className="text-xs text-gray-600 mt-1">Time waster</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-full blur-2xl opacity-60"></div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full blur-2xl opacity-60"></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <h4 className="font-bold text-gray-900 text-lg">My Roles</h4>
                  <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">+ Add Role</button>
                </div>

                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900">Team Leader</h5>
                          <p className="text-xs text-gray-600">Professional</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">8</p>
                        <p className="text-xs text-gray-600">tasks</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white rounded-lg p-2 border border-blue-200">
                        <p className="text-xs text-gray-600">This week</p>
                        <p className="text-sm font-semibold text-gray-900">5 completed</p>
                      </div>
                      <div className="flex-1 bg-white rounded-lg p-2 border border-blue-200">
                        <p className="text-xs text-gray-600">Balance</p>
                        <p className="text-sm font-semibold text-emerald-600">Good</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900">Parent</h5>
                          <p className="text-xs text-gray-600">Family</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">6</p>
                        <p className="text-xs text-gray-600">tasks</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white rounded-lg p-2 border border-emerald-200">
                        <p className="text-xs text-gray-600">This week</p>
                        <p className="text-sm font-semibold text-gray-900">4 completed</p>
                      </div>
                      <div className="flex-1 bg-white rounded-lg p-2 border border-emerald-200">
                        <p className="text-xs text-gray-600">Balance</p>
                        <p className="text-sm font-semibold text-emerald-600">Good</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900">Fitness Enthusiast</h5>
                          <p className="text-xs text-gray-600">Health</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-600">3</p>
                        <p className="text-xs text-gray-600">tasks</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-white rounded-lg p-2 border border-amber-200">
                        <p className="text-xs text-gray-600">This week</p>
                        <p className="text-sm font-semibold text-gray-900">1 completed</p>
                      </div>
                      <div className="flex-1 bg-white rounded-lg p-2 border border-amber-200">
                        <p className="text-xs text-gray-600">Balance</p>
                        <p className="text-sm font-semibold text-red-600">Needs attention</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full blur-2xl opacity-60"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-full blur-2xl opacity-60"></div>
          </div>

          <div className="order-1 lg:order-2 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm font-semibold">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              Life Balance
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Define Your Roles, Balance Your Life
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
              You're not just one thing. You're a professional, a parent, a friend, a learner. Create roles that represent all the important areas of your life and see how much attention each one is getting.
            </p>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900 block">Multiple Perspectives</span>
                  <span className="text-gray-600">View roles and track task distribution</span>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900 block">Balance Indicators</span>
                  <span className="text-gray-600">Alerts when roles need attention</span>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900 block">Role-Specific Goals</span>
                  <span className="text-gray-600">Link tasks to roles for progress tracking</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-100 text-amber-700 rounded-full text-xs sm:text-sm font-semibold">
              <Target className="w-3 h-3 sm:w-4 sm:h-4" />
              Goal Achievement
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Connect Tasks to Meaningful Goals
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
              Every task should serve a purpose. Create goals for your roles and link your daily tasks to them. Watch your progress unfold as you complete tasks aligned with what truly matters.
            </p>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900 block">Goal Tracking</span>
                  <span className="text-gray-600">Monitor progress automatically</span>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900 block">Visual Progress</span>
                  <span className="text-gray-600">See completion percentages</span>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Grid className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900 block">Smart Filtering</span>
                  <span className="text-gray-600">Filter tasks by goal</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <h4 className="font-bold text-gray-900 text-lg">Goals & Progress</h4>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-300 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900">Launch new product</h5>
                          <p className="text-xs text-gray-600">Team Leader</p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-amber-700">65%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 border border-amber-200">
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full" style={{width: '65%'}}></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">13 of 20 tasks completed</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900">Quality family time</h5>
                          <p className="text-xs text-gray-600">Parent</p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-blue-700">80%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 border border-blue-200">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full" style={{width: '80%'}}></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">8 of 10 tasks completed</p>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900">Run 5K marathon</h5>
                          <p className="text-xs text-gray-600">Fitness Enthusiast</p>
                        </div>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-emerald-700">40%</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2 border border-emerald-200">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full" style={{width: '40%'}}></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">4 of 10 tasks completed</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full blur-2xl opacity-60"></div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full blur-2xl opacity-60"></div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-violet-50 to-violet-100 border-2 border-violet-300 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">Weekly Review</h4>
                      <p className="text-sm text-gray-600">Week of Feb 16 - 22</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border border-violet-200">
                      <h5 className="font-semibold text-gray-900 mb-3">This Week's Wins</h5>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                          </div>
                          <p className="text-sm text-gray-700">Completed product launch milestone</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                          </div>
                          <p className="text-sm text-gray-700">Had 4 quality family dinners</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                          </div>
                          <p className="text-sm text-gray-700">Maintained workout routine 5 days</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white rounded-xl p-3 border border-violet-200 text-center">
                        <p className="text-2xl font-bold text-violet-600">24</p>
                        <p className="text-xs text-gray-600 mt-1">Tasks completed</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-violet-200 text-center">
                        <p className="text-2xl font-bold text-blue-600">65%</p>
                        <p className="text-xs text-gray-600 mt-1">In Quadrant II</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 border border-violet-200 text-center">
                        <p className="text-2xl font-bold text-emerald-600">Good</p>
                        <p className="text-xs text-gray-600 mt-1">Balance score</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-violet-200">
                      <h5 className="font-semibold text-gray-900 mb-3">Next Week's Focus</h5>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                          <p className="text-sm text-gray-700">Finalize Q2 strategic plan</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                          <p className="text-sm text-gray-700">Increase family time activities</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                          <p className="text-sm text-gray-700">Prep for 5K marathon training</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-violet-200 to-violet-300 rounded-full blur-2xl opacity-60"></div>
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full blur-2xl opacity-60"></div>
          </div>

          <div className="order-1 lg:order-2 space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-violet-100 text-violet-700 rounded-full text-xs sm:text-sm font-semibold">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              Weekly Rhythm
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Weekly Planning & Review
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
              Take time each week to reflect on your wins, learn from challenges, and plan ahead with intention. The weekly review helps you stay aligned with your goals and maintain balance across all your roles.
            </p>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900 block">Celebrate Progress</span>
                  <span className="text-gray-600">Review and recognize your wins</span>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900 block">Plan with Purpose</span>
                  <span className="text-gray-600">Set aligned weekly intentions</span>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Grid className="w-3 h-3 sm:w-4 sm:h-4 text-violet-600" />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900 block">Balance Check</span>
                  <span className="text-gray-600">Monitor all life areas</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-100 text-red-700 rounded-full text-xs sm:text-sm font-semibold">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              Stay on Track
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              Smart Notifications & Insights
            </h3>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
              Never miss what matters. Get intelligent reminders about overdue tasks, upcoming deadlines, and balance issues. Plus, receive personalized recommendations to help you focus on Quadrant II activities.
            </p>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900 block">Due Date Alerts</span>
                  <span className="text-gray-600">Track overdue tasks</span>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900 block">Balance Warnings</span>
                  <span className="text-gray-600">Alerts for neglected roles</span>
                </div>
              </li>
              <li className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-semibold text-gray-900 block">Smart Recommendations</span>
                  <span className="text-gray-600">Personalized optimization tips</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-200 space-y-3">
              <div className="bg-red-100 border-2 border-red-400 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-red-950 mb-1">Overdue Tasks (2)</h5>
                    <div className="space-y-2">
                      <div className="bg-white rounded-lg p-3 border border-red-300">
                        <p className="text-sm font-semibold text-gray-900">Submit quarterly report</p>
                        <p className="text-xs text-red-700 mt-1">Due 2 days ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-100 border-2 border-amber-400 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-amber-950 mb-1">Balance Alert</h5>
                    <div className="bg-white rounded-lg p-3 border border-amber-300">
                      <p className="text-sm text-gray-900">Your "Fitness Enthusiast" role needs attention</p>
                      <p className="text-xs text-gray-600 mt-1">Only 1 task completed this week</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-100 border-2 border-blue-400 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-bold text-blue-950 mb-1">Recommendation</h5>
                    <div className="bg-white rounded-lg p-3 border border-blue-300">
                      <p className="text-sm text-gray-900">You're spending 45% of time in Quadrant I</p>
                      <p className="text-xs text-gray-600 mt-1">Try scheduling more Quadrant II activities to prevent urgent tasks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-full blur-2xl opacity-60"></div>
            <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full blur-2xl opacity-60"></div>
          </div>
        </div>
      </div>

      <div className="mt-16 sm:mt-24 text-center">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-2xl">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 sm:mb-8">
            Ready to Transform Your Life?
          </h3>
          <button
            onClick={() => {
              const authSection = document.getElementById('auth');
              if (authSection) {
                const yOffset = 0;
                const y = authSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: y, behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base cursor-pointer"
          >
            Get Started Free
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
