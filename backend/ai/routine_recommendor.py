def generate_routine(hours_slept, stress_level):
    if hours_slept < 6:
        return "Try going to bed an hour earlier. Limit caffeine after 4 PM."
    elif stress_level >= 7:
        return "Add deep breathing or journaling before sleep."
    else:
        return "Maintain your current routine but try consistent sleep/wake times."
