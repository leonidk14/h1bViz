import json

from flask import Blueprint, request

from h1bViz.db import get_db

bp = Blueprint('petitions', __name__, url_prefix='/petitions')


@bp.route('/get_all_petitions_by_state', methods=['GET'])
def get_all_petitions_by_state():
    db = get_db()

    with open('h1bViz/static/us-states.json') as f:
        json_data = json.loads(f.read())

    rows = db.execute('select distinct case_status from h1b;').fetchall()

    json_data['filter_data'] = dict()
    json_data['filter_data']['case_status'] = [line['case_status'] for line in rows]

    rows = db.execute('select distinct year from h1b;').fetchall()
    years = [int(line['year']) for line in rows]
    json_data['filter_data']['year'] = [min(years), max(years)]

    rows = db.execute('select distinct state from h1b;').fetchall()
    json_data['filter_data']['states'] = [line['state'] for line in rows]

    petitions = db.execute('select count(id), state, year, case_status from h1b group by state, year, case_status;').fetchall()

    for state in json_data['features']:
        state['properties']['byYear'] = dict()
        state['properties']['caseStatus'] = dict()
        for row in petitions:
            if state['properties']['name'].lower() == row['state'].lower():
                add_to_count_dict(state['properties'], 'petitions', row['count(id)'])
                add_to_count_dict(state['properties']['byYear'], row['year'], row['count(id)'])
                add_to_count_dict(state['properties']['caseStatus'], row['case_status'], row['count(id)'])

    return json.dumps(json_data)


@bp.route('/get_filtered_petitions', methods=['POST'])
def get_filtered_petitions():
    db = get_db()
    statuses = request.form.get('caseStatus').split(",")
    year_from = int(request.form.get('yearRangeFrom'))
    year_to = int(request.form.get('yearRangeTo'))
    wage_from = request.form.get('wageFrom') or 0
    wage_to = request.form.get('wageTo') or 1e10
    states = request.form.getlist('state')
    full_time = request.form.getlist('fullTime')
    states_string = ",".join(['"' + state + '"' for state in states])
    full_time_string = ",".join(['"' + item + '"' for item in full_time])
    year_string = ",".join([str(_) for _ in range(year_from, year_to + 1)])
    case_status_string = ",".join(['"' + status + '"' for status in statuses])

    res = db.execute('select lon, lat, year, case_status from h1b where case_status in ({0}) and '
                     'year in ({1}) and cast(prevailing_wage as real)>={2} and '
                     'cast(prevailing_wage as real)<={3} and state in ({4}) '
                     'and full_time_position in ({5})'.format(case_status_string, year_string, wage_from, wage_to,
                                                              states_string, full_time_string)).fetchall()

    coords_count = dict()
    for row in res:
        coords_json = json.dumps({'lon': row['lon'], 'lat': row['lat']})
        if coords_json in coords_count:
            coords_count[coords_json]['count'] += 1
            coords_count[coords_json]['by_year'][row['year']] += 1
            add_to_count_dict(coords_count[coords_json]['case_status'], row['case_status'], 1)
        else:
            coords_count[coords_json] = dict()
            coords_count[coords_json]['count'] = 1
            coords_count[coords_json]['by_year'] = dict()
            coords_count[coords_json]['case_status'] = dict()
            for year in range(int(year_from), int(year_to) + 1):
                coords_count[coords_json]['by_year'][str(year)] = 0
            coords_count[coords_json]['by_year'][row['year']] = 1
            coords_count[coords_json]['case_status'][row['case_status']] = 1

    coords_info = []
    for coords in coords_count:
        count = coords_count[coords]['count']
        count_by_years = coords_count[coords]['by_year']
        count_case_statuses = coords_count[coords]['case_status']
        coords_dict = json.loads(coords)
        coords_dict['info'] = {'count': count}
        coords_dict['info']['byYear'] = count_by_years
        coords_dict['info']['caseStatus'] = count_case_statuses
        coords_info.append(coords_dict)

    return json.dumps(coords_info)


@bp.route('/get_filtered_petitions_by_state', methods=['POST'])
def get_filtered_petitions_by_state():
    db = get_db()
    statuses = request.form.get('caseStatus').split(",")
    year_from = int(request.form.get('yearRangeFrom'))
    year_to = int(request.form.get('yearRangeTo'))
    wage_from = request.form.get('wageFrom') or 0
    wage_to = request.form.get('wageTo') or 1e10
    states = request.form.getlist('state')
    full_time = request.form.getlist('fullTime')
    states_string = ",".join(['"' + state + '"' for state in states])
    full_time_string = ",".join(['"' + item + '"' for item in full_time])
    year_string = ",".join([str(_) for _ in range(year_from, year_to + 1)])
    case_status_string = ",".join(['"' + status + '"' for status in statuses])

    res = db.execute('select count(id), state, year, case_status from h1b where case_status in ({0}) and '
                     'year in ({1}) and cast(prevailing_wage as real)>={2} and '
                     'cast(prevailing_wage as real)<={3} and state in ({4}) '
                     'and full_time_position in ({5}) group by state, year, case_status'.format(case_status_string, year_string,
                                                                                                wage_from, wage_to, states_string,
                                                                                                full_time_string)).fetchall()

    with open('h1bViz/static/us-states.json') as f:
        json_data = json.loads(f.read())

    for state in json_data['features']:
        state['properties']['byYear'] = dict()
        state['properties']['caseStatus'] = dict()
        for row in res:
            if state['properties']['name'].lower() == row['state'].lower():
                add_to_count_dict(state['properties'], 'petitions', row['count(id)'])
                add_to_count_dict(state['properties']['byYear'], row['year'], row['count(id)'])
                add_to_count_dict(state['properties']['caseStatus'], row['case_status'], row['count(id)'])

        if 'petitions' not in state['properties']:
            state['properties']['petitions'] = -1

    return json.dumps(json_data)


def add_to_count_dict(dict_to_insert, key, value):
    if key in dict_to_insert:
        dict_to_insert[key] += value
    else:
        dict_to_insert[key] = value
