# coding:utf-8
# input: {tasks, userIds, costs}

import json
from predictors.average_predictor_each_cost_interval import AveragePredictorEachCostInterval as Predictor


def main():
    str = input()
    src = json.loads(str)
    tasks = src['tasks']
    user_ids = src['userIds']
    costs = src['costs']

    results = []
    for user_id in user_ids:
        for cost in costs:
            mean, mlow, mhigh, low, high = Predictor.predicate(tasks, user_id, cost)
            results.append({'userId': user_id, 'cost': cost, 'mean': mean, 'low': mlow, 'high': mhigh})

    result_str = json.dumps(results)
    print(result_str)


if __name__ == '__main__':
    main()
